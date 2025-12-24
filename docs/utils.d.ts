/// <reference path="./gamma.d.ts" />
export {}
declare global{
	namespace GammaInstance{ type utils = typeof GammaInstance.utils; }
	namespace Gamma{
		function utils(): GammaInstance.utils
		function utils(o: object): asserts o is GammaInstance.utils
	}
	namespace GammaInstance.utils{
	
}
}