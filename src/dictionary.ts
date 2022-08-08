export class DictionaryAccess {
  static build<K, R>(key: K, record: R, data: Map<K, Array<R>>) {
    const values = data.get(key);
    if (!values) {
      data.set(key, new Array<R>(record));
    } else {
      values.push(record);
    }
  }
  static build2<K1, K2, R>(
    key1: K1,
    key2: K2,
    record: R,
    data: Map<K1, Map<K2, Array<R>>>
  ) {
    let values = data.get(key1);
    if (!values) {
      data.set(key1, new Map<K2, Array<R>>());
      values = data.get(key1);
    }
    DictionaryAccess.build<K2, R>(key2, record, values as Map<K2, Array<R>>);
  }
  static build3<K1, K2, K3, R>(
    key1: K1,
    key2: K2,
    key3: K3,
    record: R,
    data: Map<K1, Map<K2, Map<K3, Array<R>>>>
  ) {
    let values = data.get(key1);
    if (!values) {
      data.set(key1, new Map<K2, Map<K3, Array<R>>>());
      values = data.get(key1);
    }
    DictionaryAccess.build2<K2, K3, R>(
      key2,
      key3,
      record,
      values as Map<K2, Map<K3, Array<R>>>
    );
  }
  static build4<K1, K2, K3, K4, R>(
    key1: K1,
    key2: K2,
    key3: K3,
    key4: K4,
    record: R,
    data: Map<K1, Map<K2, Map<K3, Map<K4, Array<R>>>>>
  ) {
    let values = data.get(key1);
    if (!values) {
      data.set(key1, new Map<K2, Map<K3, Map<K4, Array<R>>>>());
      values = data.get(key1);
    }
    DictionaryAccess.build3<K2, K3, K4, R>(
      key2,
      key3,
      key4,
      record,
      values as Map<K2, Map<K3, Map<K4, Array<R>>>>
    );
  }
  static build5<K1, K2, K3, K4, K5, R>(
    key1: K1,
    key2: K2,
    key3: K3,
    key4: K4,
    key5: K5,
    record: R,
    data: Map<K1, Map<K2, Map<K3, Map<K4, Map<K5, Array<R>>>>>>
  ) {
    let values = data.get(key1);
    if (!values) {
      data.set(key1, new Map<K2, Map<K3, Map<K4, Map<K5, Array<R>>>>>());
      values = data.get(key1);
    }
    DictionaryAccess.build4<K2, K3, K4, K5, R>(
      key2,
      key3,
      key4,
      key5,
      record,
      values as Map<K2, Map<K3, Map<K4, Map<K5, Array<R>>>>>
    );
  }
  static build6<K1, K2, K3, K4, K5, K6, R>(
    key1: K1,
    key2: K2,
    key3: K3,
    key4: K4,
    key5: K5,
    key6: K6,
    record: R,
    data: Map<K1, Map<K2, Map<K3, Map<K4, Map<K5, Map<K6, Array<R>>>>>>>
  ) {
    let values = data.get(key1);
    if (!values) {
      data.set(
        key1,
        new Map<K2, Map<K3, Map<K4, Map<K5, Map<K6, Array<R>>>>>>()
      );
      values = data.get(key1);
    }
    DictionaryAccess.build5<K2, K3, K4, K5, K6, R>(
      key2,
      key3,
      key4,
      key5,
      key6,
      record,
      values as Map<K2, Map<K3, Map<K4, Map<K5, Map<K6, Array<R>>>>>>
    );
  }
}
