export default class UnexhaustiveCaseError extends Error {
  /**
   * @param val The value that is being switched on
   * @param discriminant The discriminant value should be passed in directly if the discriminant is not the value's `kind` property. Discriminant is expected to be a primitive value, else can be swapped for `any` too
   *
   * @example
   * interface Circle {
   *   kind: "circle";
   * }
   * interface Square {
   *   kind: "square";
   * }
   * type Shape = Circle | Square;
   * const shape: Shape = { kind: "square" };
   * switch (shape.kind) {
   *   case "circle":
   *     console.log("circle");
   *     break;
   *   // case "square":
   *   //   console.log("square");
   *   //   break;
   *
   *   default:
   *     // Expected TS error
   *     // Argument of type 'Square' is not assignable to parameter of type 'never'.ts(2345)
   *     //
   *     // Expected JS runtime error if code is ran
   *     // UnexhaustiveCaseError: Unexhaustive check missed discriminant 'square'
   *     //                        Value type given: {"kind":"square"}
   *     throw new UnexhaustiveCaseError(shape);
   * }
   */
  constructor(val: never, discriminant?: string | number | boolean) {
    // Adding 23 spaces on the newline to match the formatting of `UnexhaustiveCaseError: `
    super(
      `Unexhaustive check missed discriminant '${
        discriminant ||
        // Skip type check for val.kind because the never type is used, which have no properties
        // @ts-ignore
        val.kind
      }'\n                       Value type given: ${JSON.stringify(val)}`
    );
  }
}

global.UnexhaustiveCaseError = UnexhaustiveCaseError;
