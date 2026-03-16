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

#NEXT 1️⃣ Scope（超重要）
2️⃣ Backpressure in Stream
3️⃣ Stream pull model
