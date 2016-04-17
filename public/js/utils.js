(function () {

   var global = window;
   if (!global.gremlin)
      global.gremlin = {};

   var ns = {};
   global.gremlin.utils = ns;

   var gremlin = global.gremlin;

   ns.isInBetweenRequestsRow = function (row, editor) {
      editor = editor || gremlin.editor;
      var pos = editor.getCursorPosition();
      var session = editor.getSession();

      return /^$/.test(session.getLine(pos.row).trim());
   };


   ns.prevRequestStart = function (editor) {
      editor = editor || gremlin.editor;
      var pos = editor.getCursorPosition();
      var session = editor.getSession();
      var curRow = pos.row;
      while (curRow > 0 ) {
         if (/^$/.test(session.getLine(curRow-1).trim())) break;
         curRow--;
      }
      return { row: curRow, column: 0};
   };

   ns.nextRequestEnd = function (editor) {
      editor = editor || gremlin.editor;
      var pos = editor.getCursorPosition();
      var session = editor.getSession();
      var curRow = pos.row;
      var maxLines = session.getLength();

      while (curRow < maxLines - 1) {
         if (/^$/.test(session.getLine(curRow+1).trim())) break;
         curRow++;
      }

      var column = (session.getLine(curRow) || "").length;

      return { row: curRow, column: column};
   };

   ns.getCurrentRequestRange = function (editor) {
      editor = editor || gremlin.editor;

      if (ns.isInBetweenRequestsRow(null, editor)) return null;

      var reqStart = ns.prevRequestStart(editor);
      var reqEnd = ns.nextRequestEnd(editor);

      return new (ace.require("ace/range").Range)(
         reqStart.row, reqStart.column,
         reqEnd.row, reqEnd.column
      );
   };

   ns.getCurrentRequest = function (editor) {
      editor = editor || gremlin.editor;

      if (ns.isInBetweenRequestsRow(null, editor)) return null;

      var request = {
         method: "GET",
         data: "",
         url: "/"
      };

      var currentReqRange = ns.getCurrentRequestRange(editor);
      request.data = editor.getSession().getTextRange(currentReqRange);
      return request;
   };

})();