export {}
declare global{
	namespace Gamma{
	function font(): typeof Gamma.font
	function font(o: object): asserts o is typeof Gamma.font
}
namespace Gamma.font{
	// todo
}
}