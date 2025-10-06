#!/usr/bin/env bash
cd "$(dirname $0)/docs"
rm monolith*.d.ts 2>/dev/null
for src in *-global.d.ts; do
dst="${src:0:${#src}-12}"
if [[ "$dst" == "gamma" ]]; then
head -n "$(wc -l < _gamma.d.ts)" _gamma.d.ts > gamma.d.ts
else
printf "/// <reference path=\"./gamma.d.ts\" />\nexport {}\ndeclare global{\n\tnamespace GammaExtensions{ type $dst = typeof GammaExtensions.$dst; }\n\tnamespace Gamma{\n\t\tfunction $dst(): GammaExtensions.$dst\n\t\tfunction $dst(o: object): asserts o is GammaExtensions.$dst\n\t}\nnamespace GammaExtensions.$dst{\n" > "$dst.d.ts"
fi
tail -n +5 $src >> "$dst.d.ts"
printf "\n}" >> "$dst.d.ts"
echo "export type * from './$dst.d.ts'" >> monolith.d.ts
echo "export type * from './$dst-global.d.ts'" >> monolith-global.d.ts
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