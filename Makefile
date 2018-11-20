DIST    := dist
NPM		:= yarn

default:
	@echo "make what?"
	@echo "  start    #start the app"
	@echo "  install  #install npm package development"
	@echo "  pack     #pack to MyDiffTool.app"

start:
	${NPM} start

install:
	${NPM} install

pack:
	rm -rf dist/
	${NPM} dist

