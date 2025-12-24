/// <reference path="./gamma.d.ts" />
export {}
declare global{
	namespace GammaInstance{ type input = typeof GammaInstance.input; }
	namespace Gamma{
		function input(): GammaInstance.input
		function input(o: object): asserts o is GammaInstance.input
	}
	namespace GammaInstance.input{
	
}
}