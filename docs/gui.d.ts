/// <reference path="./gamma.d.ts" />
export {}
declare global{
	namespace GammaInstance{ type gui = typeof GammaInstance.gui; }
	namespace Gamma{
		function gui(): GammaInstance.gui
		function gui(o: object): asserts o is GammaInstance.gui
	}
	namespace GammaInstance.gui{
	
}
}