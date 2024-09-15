// Name: Fast List Tools
// ID: FLT

(function (Scratch) {
  "use strict";

  /* -- SETUP -- */
  const vm = Scratch.vm;
  const runtime = vm.runtime;
  var listLookup = new Map();

  const getList = function (name, util) {

    const target = util.target;

    const key = util.target.sprite.name + "_" + name;
    var list = listLookup.get(key);

    if (list) {
      return list;
    }

    list = target.lookupVariableByNameAndType(name, "list");

    if (list) {
      listLookup.set(key, list);
      return list;
    }

    return null;

  }

  const getVarObjectFromName = function (name, util, type) {

    const key = type + "_" + name;

    var listObject = listLookup.get(key);
    if (listObject) {
      return listObject;
    }

    const stageTarget = runtime.getTargetForStage();
    const target = util.target;


    listObject = stageTarget.lookupVariableByNameAndType(name, type);
    if (!listObject) {
      listObject = target.lookupVariableByNameAndType(name, type);
    }

    if (listObject) {
      listLookup.set(key, listObject);

    }

    return listObject;
  };

  class TW_FLT {

    getInfo() {
      return {
        id: "arhuflt",
        name: "Fast List Tools",
        color1: "#ff661a",
        color2: "#f2590d",
        color3: "#e64d00",
        blocks: [
          {
            opcode: "accBulkOp",
            blockType: Scratch.BlockType.COMMAND,
            text: "Execute AccuOp [OP] BulkSize [CNT] at AccIndex [TGTIDX] from WeightChunk [CHUNK] at WeightIndex [SRCIDX] ",
            arguments: {
              OP: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: "1",
              },

              CNT: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: "256",
              },

              TGTIDX: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: "1",
              },

              CHUNK: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: "1",
              },

              SRCIDX: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: "1",
              }
            }
          },

          {
            opcode: "incListVals",
            blockType: Scratch.BlockType.COMMAND,
            text: "Inc [CNT] values in TgtList [TGTLIST] at index [TGTIDX] by SrcList [SRCLIST] at index [SRCIDX] ",
            arguments: {
              CNT: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: "1",
              },

              TGTLIST: {
                type: Scratch.ArgumentType.STRING,
                menu: "lists",
              },

              TGTIDX: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: "1",
              },

              SRCLIST: {
                type: Scratch.ArgumentType.STRING,
                menu: "lists",
              },

              SRCIDX: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: "1",
              }
            }
          },

          {
            opcode: "decListVals",
            blockType: Scratch.BlockType.COMMAND,
            text: "Dec [CNT] values in TgtList [TGTLIST] at index [TGTIDX] by SrcList [SRCLIST] at index [SRCIDX] ",
            arguments: {
              CNT: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: "1",
              },

              TGTLIST: {
                type: Scratch.ArgumentType.STRING,
                menu: "lists",
              },

              TGTIDX: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: "1",
              },

              SRCLIST: {
                type: Scratch.ArgumentType.STRING,
                menu: "lists",
              },

              SRCIDX: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: "1",
              }
            }
          },

          {

            opcode: "reluLAccuHidWght2",
            blockType: Scratch.BlockType.REPORTER,
            text: "ReLU [CNT] values in Accu at index [ACCUIDX] by HiddenWeight at index [HIDWGTIDX] ",
            arguments: {
              CNT: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: "1",
              },

              ACCUIDX: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: "1",
              },

              HIDWGTIDX: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: "1",
              }
            }
          }


        ],
        menus: {
          lists: {
            acceptReporters: true,
            items: "_getLists",
          },
        }
      }
    }

    reluLAccuHidWght2(args, util) {
      var res = 0;

      var accuIdx = args.ACCUIDX - 1;
      var hwIdx = args.HIDWGTIDX - 1;
      var accList = getList("NNUE_Accumulator", util).value;
      var hwList = getList("NNUE_HiddenWeights", util).value;

      var accuIdxEnd = accuIdx + args.CNT;

      while (accuIdx < accuIdxEnd) {
        var acc = accList[accuIdx++];
        if (acc > 0) {
          res += acc * hwList[hwIdx];
        }
        hwIdx++;
      }
      return res;
    }

    reluLAccuHidWght(args, util) {
      var res = 0;

      const accList = getVarObjectFromName(args.ACCULIST, util, "list");
      const hidWgtList = getVarObjectFromName(args.HIDWGTLIST, util, "list");

      var accuIdx = args.ACCUIDX - 1;
      var hidWgIdx = args.HIDWGTIDX - 1;
      var accListtImpl = accList.value;
      var hidWgtListImpl = hidWgtList.value;

      var accuIdxEnd = accuIdx + args.CNT;

      while (accuIdx < accuIdxEnd) {
        var acc = accListtImpl[accuIdx++];
        if (acc > 0) {
          res += acc * hidWgtListImpl[hidWgIdx];
        }
        hidWgIdx++;
      }
      return res;
    }

    accBulkOp(args, util) {

      var srcIdx = args.SRCIDX - 1;
      var tgtIdx = args.TGTIDX - 1;

      var tgtIdxEnd = tgtIdx + args.CNT;
      var tgtList = getList("NNUE_Accumulator", util).value;
      var srcList;

      if (args.CHUNK == 1) {
        srcList = getList("NNUE_InputWeights_1", util).value;
      }
      else if (args.CHUNK == 2) {
        srcList = getList("NNUE_InputWeights_2", util).value;
      }

      if (args.OP == 1) {
        while (tgtIdx < tgtIdxEnd) {
          tgtList[tgtIdx++] += srcList[srcIdx++];
        }
      }
      else if (args.OP == 2) {
        while (tgtIdx < tgtIdxEnd) {
          tgtList[tgtIdx++] -= srcList[srcIdx++];
        }
      }

    }

    incListVals(args, util) {

      const srcList = getVarObjectFromName(args.SRCLIST, util, "list");
      const tgtList = getVarObjectFromName(args.TGTLIST, util, "list");

      var srcIdx = args.SRCIDX - 1;
      var tgtIdx = args.TGTIDX - 1;
      var srcListImpl = srcList.value;
      var tgtListImpl = tgtList.value;

      var tgtIdxEnd = tgtIdx + args.CNT;

      while (tgtIdx < tgtIdxEnd) {
        tgtListImpl[tgtIdx++] += srcListImpl[srcIdx++];
      }

    }

    decListVals(args, util) {
      const srcList = getVarObjectFromName(args.SRCLIST, util, "list");
      const tgtList = getVarObjectFromName(args.TGTLIST, util, "list");

      var srcIdx = args.SRCIDX - 1;
      var tgtIdx = args.TGTIDX - 1;
      var srcListImpl = srcList.value;
      var tgtListImpl = tgtList.value;

      var tgtIdxEnd = tgtIdx + args.CNT;

      while (tgtIdx < tgtIdxEnd) {
        tgtListImpl[tgtIdx++] -= srcListImpl[srcIdx++];
      }

    }

    _getLists() {
      // @ts-expect-error - Blockly not typed yet
      const lists =
        typeof Blockly === "undefined"
          ? []
          : Blockly.getMainWorkspace()
            .getVariableMap()
            .getVariablesOfType("list")
            .map((model) => model.name);
      if (lists.length > 0) {
        return lists;
      } else {
        return [""];
      }
    }

  }

  Scratch.extensions.register(new TW_FLT());
  
})(Scratch);
