export {}
declare global{
	namespace GammaExtensions{ type font = typeof GammaExtensions.font; }
	namespace Gamma{
		function font(): GammaExtensions.font
		function font(o: object): asserts o is GammaExtensions.font
	}
namespace GammaExtensions.font{
	// todo
}
}