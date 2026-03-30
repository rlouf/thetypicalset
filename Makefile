QUARTZ_VERSION := v4.5.2

quartz/:
	git clone --depth 1 --branch $(QUARTZ_VERSION) https://github.com/jackyzha0/quartz.git quartz-tmp
	mv quartz-tmp/quartz quartz
	mv quartz-tmp/package.json .
	mv quartz-tmp/package-lock.json .
	mv quartz-tmp/tsconfig.json .
	mv quartz-tmp/globals.d.ts .
	mv quartz-tmp/index.d.ts .
	rm -rf quartz-tmp

setup: quartz/
	npm ci

serve: setup
	npx quartz build --serve

build: setup
	npx quartz build

clean:
	rm -rf quartz node_modules package.json package-lock.json tsconfig.json globals.d.ts index.d.ts public .quartz-cache

.PHONY: setup serve build clean
