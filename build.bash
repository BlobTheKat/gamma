#!/usr/bin/env bash

cd docs
for src in *-global.d.ts; do
dst="${src:0:${#src}-12}.d.ts"
if [[ "$dst" == "gamma.d.ts" ]]; then
printf "export {}\ndeclare global{\n\tfunction Gamma(canvas?: HTMLCanvasElement): typeof Gamma\n\tfunction Gamma(canvas?: HTMLCanvasElement, o: object): asserts o is typeof Gamma\n\nnamespace Gamma{\n" > $dst
tail -n +3 $src >> $dst
else
printf "export {}\ndeclare global{\n\tnamespace Gamma{\n\tfunction font(): typeof Gamma.font\n\tfunction font(o: object): asserts o is typeof Gamma.font\n}\nnamespace Gamma.font{\n" > $dst
tail -n +3 $src >> $dst
fi
printf "\n}" >> $dst
done
cd ../src
rm ../min/*
ALL=
for src in *.js; do
	[[ "$src" == gamma.* ]] && continue
	dst="${src:0:${#src}-3}.min.js"
	npx terser $src -c -m -o "../min/$dst"
	ALL="$ALL $dst"
done
cp gamma.min.js ../min
cd ../min
cat gamma.min.js $ALL > monolith.min.js