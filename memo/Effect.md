## stream: Stream.Stream<>があったとき、stream.pipeの中の処理は、streamが流れてくる際に何を行うかを定義しているが、この時点で実行されるわけではなく、計画をしているのみ

## Stream.mapは流れてきた際の実際のバッファなどを処理し、後工程に渡す作業で、returnとしてはStream実体だが、mapの戻りはStreamである。つまり、Streamの中身を変換するためのもの

## Stream.unwrapの役割はEffectをUnwrapして、Streamを返すためのもの

## Effect.gen(function* () {})の役割は処理を行い、Effectを返す。yield* はfunction\* (){}の中だけで行える

## Effectのオブジェクト自体は、実際中の作業は実行しない。処理の設計図である。実行させる手段は、 yield\* , Effect.runFork/runChildなど

## Stream.runForEachは第１引数のinput　Streamを処理し、そのElementごとにEffect処理をして、Effectを返すもの。Chunkごとに行う場合はStream.runForEachChunk

## Effect.promise関数は、中で指定されるPromise関数を実行するEffectを生成すること（実行するわけではない）

## Effect.tapは通常、元からpipeされたところで実行し、その結果のEffectに対して何らかの処理はするが、変化は加えないもの

## Effect.syncは同期処理を行うが、エラーを起こしてはならない(起こすとtry/catchされない）ので、同期処理を簡便にEffectにする作業を意味する。tap は副作用を書くところなので、syncを使うことが多いが、syncでしか使ってはいけないわけではない

## Effect.forkChildは処理を別Fiberで実行する

## Fiberは超軽量スレッドだが、いわゆるOSスレッドではない。並列処理、キャンセル、Join、構造的に関連付けして終わらせたりすることも可能。Fiberの状態はRunning(実行中)、Suspended（非同期処理待ち）、Done（成功、失敗、例外）、Interrupted（キャンセルされた）のどれかになる。Effectが完了するまでDoneにならない。自分から処理を手放すまで実行される。yieldをする、ということはいったん手放すということ

## EffectのflatMapは、いわゆるmap処理がEffectの中身を処理して別のオブジェクトを返すのに対して、flatMapはEffectの中身を処理して別のオブジェクトを持つEffectを返す。Effect.map内でEffectを返すとEffect＜Effect＞＞になってしまうが、flatMapでは合成されて一つのEffectになる。

## Stream.callback Node Stream自身がPush型なので、Pull型であるEffectに合うよう、CallbackごとにPullするよう変換する。

1. Node StreamがPushとしてdataイベントでコールされる
2. そのデータをQueue.offerで蓄積する
3. Queue.offer自体は満杯時に待機できるが、Nodeのcallbackは非同期に待てないため、
4. Queueのサイズを監視し、溢れそうになったらduplex/transformをpauseすることでNode Streamのpushを制御する
5. そして、Queueが消費されて余裕ができたタイミングでresumeすることでBack Pressureを実現する
6. Stream.callbackでは、このQueueを元にしたStreamが構築されるが、callback自体は1回だけ実行され、イベント登録などのセットアップを行う
7. その後、StreamはFiberによってpullされる
8. Fiberがループしており、pullのたびに内部のEffect（Queue.take）が実行される
9. Effect自体が継続実行されるわけではなく、Fiberが繰り返しEffectを実行している

## Queue はPush と Pull のバッファという役割

Producer
│
│ offer
▼
Queue
▲
│ take
Consumer

Node Stream
│
│ data
▼
Queue.offer
│
▼
Stream.fromQueue
│
▼
Stream.map
│
▼
Stream.runForEach

## EffectがPull型、ということは設計図であるEffect上の後工程が前工程に要求する、というイメージ

stream.pipe(
Stream.map(a => a \* 2),
Stream.filter(a => a > 10),
Stream.runForEach(console.log)
)

構造

source → map → filter → runForEach

しかし実行時の制御は

runForEach
↑
filter
↑
map
↑
source

です。実際にこの順で実行するのではなく、runForEachするから次お願い→filterするから次お願い→mapするから次お願い->sourceの中のChunkを渡す

## Scope

ScopeはC#のusingに似ていて、File・DBなどクローズ処理を保証させるための仕組みのオブジェクト
他のモノと違って、

- 非同期サポート、並行処理をしても問題なし
- 複数リソースを合成して一つにすることができる
- クリーンアップ処理を重複して行っても安全

ファイルについては、確かにスコープ管理する（Stream.scopedなどで）

DBについても短い処理で完結する場合はそうなのだが、クローズしてしまうと、再度オープンするのに時間・リソースを食うのでクローズは実際にせず、コネクションプールの管理をすることが多いと思う
また、ネット上のシステムへのセッションも似たような感じで、処理が終わったらすぐログアウトするわけではない（別の処理が後で行われるかもしれない）
こうしたものはEffectでLayerとして管理し、その上位のアプリレベルで終了時にクローズなどを行う
Layer.scopedは長命でアプリ単位で管理

Scope同士は親子関係で束ねる（統合する）ことで管理する＝単一のScopeツリーとして管理する
依存関係がないLayerの親はScopeツリーのルートのScopeの子供として、依存関係があればそこで依存関係を構築する

Scopeツリーは、Effect.runPromiseなど実行されるたびに作られる。

よって、Web Serviceがあったとして、サービス内でDB接続を管理している場合、LayerとしてExpressであったりHonoであったりNitroであったりのルーティング含めた全体をEffect化し、そのルート内でDBをScope化する
仮にルーティングハンドラーごとにLayer化した場合、プログラミングとしてはわかりやすいが、これだとリクエストごとにDB接続・解除を繰り返すことになる

## Effect.gen(function* () {})、中で使う yield* の役割

yield* は「await + 依存性注入 + 失敗処理 + 中断管理」をまとめたもの
Effect.gen(function* () { ... })
は
「それを型安全に書くための構文」

yield　はiterator自身を外に出し、yield\* はiteratorの中身を出す
Effect.genで考える、かつそれがネストした状態を考えると
中でiteratorを自分で回す必要がなく、フラットに処理ができるようになるので管理が容易

## forkChild / Effect.forkDetach / Effect.forkScoped の違い

いずれも別Fiberで実行するようになるが、
forkChildは現在のFiberにぶら下がる子Fiber上で実行されるので、親が終われば子がInterruptされる
forkDetachは別Fiberで実行するので、親が終わっても、Scopeが閉じても生きている。
forkScopedは同じScopeに属し、Scopeが閉じるとそのFiberがInterruptされる
Node Streamを扱う場合、Node Stream側のPush（主導権）のため、下流が止まる可能性がある。forkChildはあくまで上流が止まった場合に子がInterruptされるにすぎないため、Stream.ensuringの中でinterruptしてあげる必要がある

## Stream.scoped の内部構造

Scope付きのStreamを作成し、終わったらリソースを解放する（クローズする）ことを保証する

## StreamのrunCollect, runDrain, runSinkの違い

いずれもStream→Effectに変換する
| API | 返り値 | 用途 | 戻り |
| --- | --- | --- | --- |
| runCollect | Effect<Chunk<A>> | 全件メモリに集める | Stream<A> → Effect<Chunk<A>> |
| runDrain | Effect<void> | 結果不要・副作用だけ | Stream<A> → Effect<void> |
| runSink | Effect<Z> or Effect<Fiber> | sinkに流す | Stream<A> → Sink<A, Z> |

# Sink　とは

SinkはStreamの終端処理をするもの

- データの処理
- 結果を作る
- 終了条件を決める

その終端処理が同期であれば中のデータがEffectで返されるが、非同期処理であれば、Effectの中は中のデータを返すFiberになる
Stream<A> → Sink<A, Z>
↓
Effect<Z> または Effect<Fiber<Z>>

## 「SinkとChannelの関係（内部実装）」

Streamはデータの流れの処理を表し、Stream処理（入出力+終了）の最小単位としてChannelが存在する

概念的にはStreamもSinkもChannelの一種である
Channel（本体）
├── Stream（Outを使う）
└── Sink （Resultを使う）

## 「なぜSinkがあるとBackpressureが自然に解決されるのか」

Stream.take(5)のようにすると、最初の5要素だけを要求し、それ以降は終了として扱う。

EffectはPull型であるため、終端（Sink）が要求した分だけ上流が実行される。
そのため、終端が要求を止めれば、それ以上上流の処理は起動されない。

この構造により、終端が処理する量や速度を完全に制御でき、
上流から勝手にデータが流れてくることは仕組み上発生しない。

したがって、Node StreamのようなPush型が絡まない限り、
Backpressureは自然に解決される。

## 「なぜStreamはEffectの単なる配列ではないのか」

StreamはEffectの配列ではなく、
必要に応じてデータを生成する遅延評価の仕組みである。

そのため、
・無限データを扱える
・Backpressureが自然に成立する
・途中終了が可能
・リソース管理が安全にできる

Chunkはパフォーマンス最適化のための実装であり、
本質は「Pullによる逐次生成」にある。

## Chunk 処理について

Chunkは、StreamのPullモデルを維持しながら、
・関数呼び出し回数削減
・Fiberスケジューリング効率化
・CPUキャッシュ効率向上
を実現するためのバッチ単位である

ChannelはChunk単位でループすることで、
高性能かつBackpressureを維持したストリーム処理を実現している

## Stream fusionについて

Stream.map(f).map(g).filter(h)
を直観的に
各map/filterごとにさらにChunk処理をして、とすると大変に見える。

StreamはEffectと同様に実行計画であるが、
Streamは複数要素を扱うループ構造（Channel）として表現される。

そのため、mapやfilterなどの操作は実行時に逐次処理されるのではなく、
実行前に1つのChannelとして合成される。

結果として、実行時にはChunk単位で、
合成済みの処理が一度のループで適用されるため、
中間データや余分なループを発生させず高速に処理できる。

## StreamのflatMapがfusionしにくいのは

flatMapは1つの入力から複数の要素（Stream）を生成し、
それを動的に結合する処理であるため、
処理構造が実行時に決定される。

そのため、mapのように静的に処理を合成（fusion）することが難しく、
ループのネストやChunkの分断が発生することで、
最適化の自由度が制限される。

## 下における inputを入力にしたメソッドは誰が呼ぶ？

export const throughNodeStream =
<I, O>(duplex: Duplex) =>
<E, R>(input: Stream.Stream<I, E, R>): Stream.Stream<O, E | IOError, R> =>
Stream.unwrap(＊＊＊)
に対して、実際の呼び出しでは、以下のようにしている。　
これは、Function.pipeを通じて、throughNodeStream()に対してstreamが渡される、という理解であっているか（Function.pipeは内部の関数は引数を一つだけ持つように縛りがある）
Effectは後続のPullによって始まるから、throughNodeStream()側が必要としているinputを上のstreamから渡すようFunction.pipeに要求している？
で、Function.pipeは中にある中にある関数群（第2引数以降）を呼び出していくが、必ずその関数は引数を一つだけ持つことが求められる。
これができない場合はEffect.gen(function\* (){})で実装すべき
Function.pipe(
stream,
throughNodeStream<string | Buffer | Uint8Array, Record<string, string>>(
parse(convertReadOption(options)),
),
)

## 2026/3/17時点のthroughNodeStreamは従来のPull型ではなく、Push型

Stream.unwrapはEffectを実行してStreamを生成するためのものであり、
Stream.callbackのようにStreamを構築するのではなく、
Streamの生成自体をEffectに遅延させている

内部では、input StreamをrunForEachで消費し、
各chunkをNodeのduplex.writeに渡す

writeがfalseを返した場合はNodeの内部バッファが詰まっているため、
drainイベントを待つことでNode側のBackpressureに従う

すべてのchunkの書き込みが完了した後にduplex.end()を呼ぶ

この処理はFiberとしてforkされ、非同期に実行される

一方で、duplex（readable側）をAsyncIterableとして扱い、
Stream.fromAsyncIterableによってEffect Streamに変換する

Stream.ensuringでは、このStreamの終了（正常・異常・中断）に関わらず、
writer Fiberのinterruptとduplex.destroy()を実行し、
リソースリークを防ぐ

この構造はEffect Streamのpull型Backpressureではなく、
Node StreamのBackpressure（write/drain）を利用したブリッジである

export const throughNodeStream =
<I, O>(duplex: Duplex) =>
<E, R>(input: Stream.Stream<I, E, R>): Stream.Stream<O, E | IOError, R> =>
Stream.unwrap(
Effect.gen(function* () {
const writer = yield* Stream.runForEach(input, (chunk) =>
Effect.promise<void>(
() =>
new Promise((resolve) => {
const ok = duplex.write(chunk as any);

                if (ok) resolve();
                else {
                  duplex.once('drain', resolve);
                }
              }),
          ),
        ).pipe(
          Effect.tap(() =>
            Effect.sync(() => {
              duplex.end();
            }),
          ),
          Effect.forkChild,
        );

        const readable = duplex as AsyncIterable<O>;

        return Stream.fromAsyncIterable<O, IOError>(readable, (e) =>
          unknownError(IOError, e, 'node stream error'),
        ).pipe(
          Stream.ensuring(
            Effect.gen(function* () {
              yield* Fiber.interrupt(writer);
              if (!duplex.destroyed) {
                duplex.destroy();
              }
            }),
          ),
        );
      }),
    );
