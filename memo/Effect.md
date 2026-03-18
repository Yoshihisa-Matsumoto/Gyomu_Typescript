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
