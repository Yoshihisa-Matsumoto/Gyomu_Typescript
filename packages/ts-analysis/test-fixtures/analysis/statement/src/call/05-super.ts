class BaseClass {
  baseMethod(value: string): void {
    console.log(value)
  }
}

export class ChildClass extends BaseClass {
  childMethod(value: string): void {
    console.log(value)
  }

  execute(value: string): void {
    // super property access
    super.baseMethod(value)
  }
}
