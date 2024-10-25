DIST    := dist
NPM	:= yarn

default:
	@echo "make what?"
	@echo "  start    #start the app"
	@echo "  install  #install npm package development"
	@echo "  pack_mac #pack to MyDiffTool.app for MacOS"
	@echo "  pack_mac_arm64 #pack to MyDiffTool.app for MacOS (Apple Silicon)"
	@echo "  pack_win #pack to MyDiffTool.exe for Windows"

start:
	${NPM} start

install:
	${NPM} install

pack_win:
	rm -rf ${DIST}/
	${NPM} dist-win

pack_mac:
	rm -rf ${DIST}/
	${NPM} dist-mac

pack_mac_arm64:
	rm -rf ${DIST}/
	${NPM} dist-mac --arm64
