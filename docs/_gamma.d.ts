export {}
declare global{
	function Gamma(canvas?: HTMLCanvasElement, _?: undefined, flags?: GammaCreationFlags): GammaInstance
	function Gamma(canvas?: HTMLCanvasElement, o: object, flags?: GammaCreationFlags): asserts o is GammaInstance
	namespace Gamma{
		/**
		 * Options used internally for createImageBitmap(). Do not modify this unless you absolutely know what you are doing
		 */
		const bitmapOpts: ImageBitmapOptions
		const enum GammaCreationFlags{
			/**
			 * Allocate a stencil buffer for IF_SET/IF_UNSET/SET/UNSET functionality. When this flag is disabled, the stencil buffer will not be allocated and will behave as if it is always 0.
			 */
			STENCIL = 1 << 0,
			/**
			 * Allocate an alpha channel. When this flag is disabled, the default draw target acts like an RGB texture and some blending tricks no longer work.
			 */
			ALPHA_CHANNEL = 1 << 1,
			/**
			 * Assumes the values drawn are premultiplied, which is standard for the blending model used by Gamma
			 */
			PREMULTIPLIED_ALPHA = 1 << 2,
			/**
			 * Automatically clear the canvas before each frame, which allows for an optimization to avoid copying the entire canvas contents each frame
			 */
			AUTO_CLEAR_BUFFER = 1 << 3,
			/**
			 * Use implementation-defined antialiasing for the default draw target. This antialiasing is _usually_ MSAA but may be faked on low end devices or not used at all (e.g retina display where the browser has decided that aliasing is not noticeable enough at default scale to justify the performance cost). This antialiasing is never edge smoothing, which means it should not cause artifacts to appear and "break" your render (e.g gaps between tiled sprites)
			 */
			MSAA = 1 << 4
		}
	}
	interface Math{
		/**
		 * `PI2 == PI*2`, also known as tau.
		 * 
		 * This is the ratio of the circumference of a circle to its radius.
		 */
		readonly PI2: number
	}
	/**
	 * Polyfill of `setImmediate`
	 * 
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/setImmediate)
	 */
	declare function setImmediate(handler: TimerHandler, ...arguments: any[]): number
	/**
	 * Polyfill of `clearImmediate`
	 * 
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/clearImmediate)
	 */
	declare function clearImmediate(id: number | undefined): void

	/** The mathematical constant e. This is Euler's number, the base of natural logarithms. */
	const E: number
	/** The natural logarithm of 10. */
	const LN10: number
	/** The natural logarithm of 2. */
	const LN2: number
	/** The base-2 logarithm of e. */
	const LOG2E: number
	/** The base-10 logarithm of e. */
	const LOG10E: number
	/** Pi. This is the ratio of the circumference of a circle to its diameter. */
	const PI: number
	/**
	 * `PI2 == PI*2`, also known as tau.
	 * 
	 * This is the ratio of the circumference of a circle to its radius.
	 */
	const PI2: number
	/** The square root of 0.5, or, equivalently, one divided by the square root of 2. */
	const SQRT1_2: number
	/** The square root of 2. */
	const SQRT2: number
	/**
	 * Returns the absolute value of a number (the value without regard to whether it is positive or negative).
	 * For example, the absolute value of -5 is the same as the absolute value of 5.
	 * @param x A numeric expression for which the absolute value is needed.
	 */
	function abs(x: number): number
	/**
	 * Returns the arc cosine (or inverse cosine) of a number.
	 * @param x A numeric expression.
	 */
	function acos(x: number): number
	/**
	 * Returns the arcsine of a number.
	 * @param x A numeric expression.
	 */
	function asin(x: number): number
	/**
	 * Returns the arctangent of a number.
	 * @param x A numeric expression for which the arctangent is needed.
	 */
	function atan(x: number): number
	/**
	 * Returns the angle (in radians) between the X axis and the line going through both the origin and the given point.
	 * @param y A numeric expression representing the cartesian y-coordinate.
	 * @param x A numeric expression representing the cartesian x-coordinate.
	 */
	function atan2(y: number, x: number): number
	/**
	 * Returns the smallest integer greater than or equal to its numeric argument.
	 * @param x A numeric expression.
	 */
	function ceil(x: number): number
	/**
	 * Returns the cosine of a number.
	 * @param x A numeric expression that contains an angle measured in radians.
	 */
	function cos(x: number): number
	/**
	 * Returns e (the base of natural logarithms) raised to a power.
	 * @param x A numeric expression representing the power of e.
	 */
	function exp(x: number): number
	/**
	 * Returns the greatest integer less than or equal to its numeric argument.
	 * @param x A numeric expression.
	 */
	function floor(x: number): number
	/**
	 * Returns the natural logarithm (base e) of a number.
	 * @param x A numeric expression.
	 */
	function log(x: number): number
	/**
	 * Returns the larger of a set of supplied numeric expressions.
	 * @param values Numeric expressions to be evaluated.
	 */
	function max(...values: number[]): number
	/**
	 * Returns the smaller of a set of supplied numeric expressions.
	 * @param values Numeric expressions to be evaluated.
	 */
	function min(...values: number[]): number
	/**
	 * Returns the value of a base expression taken to a specified power.
	 * @param x The base value of the expression.
	 * @param y The exponent value of the expression.
	 */
	function pow(x: number, y: number): number
	/** Returns a pseudorandom number between 0 and 1. */
	function random(): number
	/**
	 * Returns a supplied numeric expression rounded to the nearest integer.
	 * @param x The value to be rounded to the nearest integer.
	 */
	function round(x: number): number
	/**
	 * Returns the sine of a number.
	 * @param x A numeric expression that contains an angle measured in radians.
	 */
	function sin(x: number): number
	/**
	 * Returns the square root of a number.
	 * @param x A numeric expression.
	 */
	function sqrt(x: number): number
	/**
	 * Returns the tangent of a number.
	 * @param x A numeric expression that contains an angle measured in radians.
	 */
	function tan(x: number): number

	/**
	 * Returns the number of leading zero bits in the 32-bit binary representation of a number.
	 * @param x A numeric expression.
	 */
	function clz32(x: number): number

	/**
	 * Returns the result of 32-bit multiplication of two numbers.
	 * @param x First number
	 * @param y Second number
	 */
	function imul(x: number, y: number): number

	/**
	 * Returns the sign of the x, indicating whether x is positive, negative or zero.
	 * @param x The numeric expression to test
	 */
	function sign(x: number): number

	/**
	 * Returns the base 10 logarithm of a number.
	 * @param x A numeric expression.
	 */
	function log10(x: number): number

	/**
	 * Returns the base 2 logarithm of a number.
	 * @param x A numeric expression.
	 */
	function log2(x: number): number

	/**
	 * Returns the natural logarithm of 1 + x.
	 * @param x A numeric expression.
	 */
	function log1p(x: number): number

	/**
	 * Returns the result of (e^x - 1), which is an implementation-dependent approximation to
	 * subtracting 1 from the exponential function of x (e raised to the power of x, where e
	 * is the base of the natural logarithms).
	 * @param x A numeric expression.
	 */
	function expm1(x: number): number

	/**
	 * Returns the hyperbolic cosine of a number.
	 * @param x A numeric expression that contains an angle measured in radians.
	 */
	function cosh(x: number): number

	/**
	 * Returns the hyperbolic sine of a number.
	 * @param x A numeric expression that contains an angle measured in radians.
	 */
	function sinh(x: number): number

	/**
	 * Returns the hyperbolic tangent of a number.
	 * @param x A numeric expression that contains an angle measured in radians.
	 */
	function tanh(x: number): number

	/**
	 * Returns the inverse hyperbolic cosine of a number.
	 * @param x A numeric expression that contains an angle measured in radians.
	 */
	function acosh(x: number): number

	/**
	 * Returns the inverse hyperbolic sine of a number.
	 * @param x A numeric expression that contains an angle measured in radians.
	 */
	function asinh(x: number): number

	/**
	 * Returns the inverse hyperbolic tangent of a number.
	 * @param x A numeric expression that contains an angle measured in radians.
	 */
	function atanh(x: number): number

	/**
	 * Returns the square root of the sum of squares of its arguments.
	 * @param values Values to compute the square root for.
	 *     If no arguments are passed, the result is +0.
	 *     If there is only one argument, the result is the absolute value.
	 *     If any argument is +Infinity or -Infinity, the result is +Infinity.
	 *     If any argument is NaN, the result is NaN.
	 *     If all arguments are either +0 or −0, the result is +0.
	 */
	function hypot(...values: number[]): number

	/**
	 * Returns the integral part of the a numeric expression, x, removing any fractional digits.
	 * If x is already an integer, the result is x.
	 * @param x A numeric expression.
	 */
	function trunc(x: number): number

	/**
	 * Returns the nearest single precision float representation of a number.
	 * @param x A numeric expression.
	 */
	function fround(x: number): number

	/**
	 * Returns an implementation-dependent approximation to the cube root of number.
	 * @param x A numeric expression.
	 */
	function cbrt(x: number): number

	type GammaInstance = typeof GammaInstance
namespace GammaInstance{
}}