DIST    := dist
NPM		:= yarn

default:
	@echo "make what?"
	@echo "  install  #install npm package development"
	@echo "  pack     #pack to MyDiffTool.app"

install:
	${NPM} install

pack:
	${NPM} dist

