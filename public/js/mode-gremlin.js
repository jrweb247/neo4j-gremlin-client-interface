ace.define('ace/mode/gremlin', ['require', 'exports', 'module' , 'ace/tokenizer', 'ace/lib/oop', 'ace/mode/text', 'ace/tokenizer', 'ace/mode/javascript_highlight_rules', 'ace/mode/matching_brace_outdent', 'ace/mode/behaviour/cstyle', 'ace/mode/folding/cstyle', 'ace/worker/worker_client'], function (require, exports, module) {

   var oop = require("../lib/oop");
   var TextMode = require("./text").Mode;
   var Tokenizer = require("../tokenizer").Tokenizer;
   var HighlightRules = require("./javascript_highlight_rules").GroovyHighlightRules;
   var MatchingBraceOutdent = require("./matching_brace_outdent").MatchingBraceOutdent;
   var CstyleBehaviour = require("./behaviour/cstyle").CstyleBehaviour;
   var CStyleFoldMode = require("./folding/cstyle").FoldMode;
   var WorkerClient = require("../worker/worker_client").WorkerClient;

   var Mode = function () {
      this.$tokenizer = new Tokenizer(new HighlightRules().getRules());
      this.HighlightRules = HighlightRules;
      this.$outdent = new MatchingBraceOutdent();
      this.$behaviour = new CstyleBehaviour();
      this.foldingRules = new CStyleFoldMode();
   };
   oop.inherits(Mode, TextMode);

   exports.Mode = Mode;
});

ace.define('ace/mode/javascript_highlight_rules', ['require', 'exports', 'module' , 'ace/mode/doc_comment_highlight_rules', 'ace/mode/text_highlight_rules'], function (require, exports, module) {

    var oop = require("../lib/oop");
    var DocCommentHighlightRules = require("./doc_comment_highlight_rules").DocCommentHighlightRules;
    var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

    var GroovyHighlightRules = function() {

        var keywords = (
            "assert|with|abstract|continue|for|new|switch|g|graph|" +
            "assert|default|goto|package|synchronized|" +
            "boolean|do|if|private|this|" +
            "break|double|implements|protected|throw|" +
            "byte|else|import|public|throws|" +
            "case|enum|instanceof|return|transient|" +
            "catch|extends|int|short|try|" +
            "char|final|interface|static|void|" +
            "class|finally|long|strictfp|volatile|" +
            "def|float|native|super|while|" +
            "asAdmin|map|flatMap|id|label|identity|constant|V|to|out|in|both|toE|outE|inE|bothE|toV|inV|outV|bothV|otherV|order|properties|values|propertyMap|valueMap|select|mapValues|mapKeys|key|value|path|match|sack|loops|select|unfold|fold|count|sum|max|min|mean|group|groupCount|tree|addV|addE|to|from|to|from|addE|addOutE|addInE|filter|or|and|inject|dedup|where|has|hasNot|hasLabel|hasId|hasKey|hasValue|is|not|coin|range|limit|tail|timeLimit|simplePath|cyclicPath|sample|drop|sideEffect|cap|subgraph|aggregate|group|groupCount|tree|sack|store|profile|property|branch|choose|union|coalesce|repeat|emit|until|times|local|as|barrier|by|option|iterate"
        );

        var buildinConstants = (
            "null|Infinity|NaN|undefined"
        );

        var langClasses = (
            "AbstractMethodError|AssertionError|ClassCircularityError|"+
            "ClassFormatError|Deprecated|EnumConstantNotPresentException|"+
            "ExceptionInInitializerError|IllegalAccessError|"+
            "IllegalThreadStateException|InstantiationError|InternalError|"+
            "NegativeArraySizeException|NoSuchFieldError|Override|Process|"+
            "ProcessBuilder|SecurityManager|StringIndexOutOfBoundsException|"+
            "SuppressWarnings|TypeNotPresentException|UnknownError|"+
            "UnsatisfiedLinkError|UnsupportedClassVersionError|VerifyError|"+
            "InstantiationException|IndexOutOfBoundsException|"+
            "ArrayIndexOutOfBoundsException|CloneNotSupportedException|"+
            "NoSuchFieldException|IllegalArgumentException|NumberFormatException|"+
            "SecurityException|Void|InheritableThreadLocal|IllegalStateException|"+
            "InterruptedException|NoSuchMethodException|IllegalAccessException|"+
            "UnsupportedOperationException|Enum|StrictMath|Package|Compiler|"+
            "Readable|Runtime|StringBuilder|Math|IncompatibleClassChangeError|"+
            "NoSuchMethodError|ThreadLocal|RuntimePermission|ArithmeticException|"+
            "NullPointerException|Long|Integer|Short|Byte|Double|Number|Float|"+
            "Character|Boolean|StackTraceElement|Appendable|StringBuffer|"+
            "Iterable|ThreadGroup|Runnable|Thread|IllegalMonitorStateException|"+
            "StackOverflowError|OutOfMemoryError|VirtualMachineError|"+
            "ArrayStoreException|ClassCastException|LinkageError|"+
            "NoClassDefFoundError|ClassNotFoundException|RuntimeException|"+
            "Exception|ThreadDeath|Error|Throwable|System|ClassLoader|"+
            "Cloneable|Class|CharSequence|Comparable|String|Object"
        );

        // TODO var importClasses = "";

        var keywordMapper = this.createKeywordMapper({
            "variable.language": "this",
            "keyword": keywords,
            "support.function": langClasses,
            "constant.language": buildinConstants
        }, "identifier");

        this.$rules = {
                "start" : [
                {
                    token : "comment",
                    regex : "\\/\\/.*$"
                },
                DocCommentHighlightRules.getStartRule("doc-start"),
                {
                    token : "comment", // multi line comment
                    regex : "\\/\\*",
                    next : "comment"
                }, {
                    token : "string",
                    regex : '"""',
                    next  : "qqstring"
                }, {
                    token : "string",
                    regex : "'''",
                    next  : "qstring"
                }, {
                    token : "string", // single line
                    regex : '["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]'
                }, {
                    token : "string", // single line
                    regex : "['](?:(?:\\\\.)|(?:[^'\\\\]))*?[']"
                }, {
                    token : "constant.numeric", // hex
                    regex : "0[xX][0-9a-fA-F]+\\b"
                }, {
                    token : "constant.numeric", // float
                    regex : "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"
                }, {
                    token : "constant.language.boolean",
                    regex : "(?:true|false)\\b"
                }, {
                    token : keywordMapper,
                    // TODO: Unicode escape sequences
                    // TODO: Unicode identifiers
                    regex : "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
                }, {
                    token : "keyword.operator",
                    regex : "\\?:|\\?\\.|\\*\\.|<=>|=~|==~|\\.@|\\*\\.@|\\.&|as|in|is|!|\\$|%|&|\\*|\\-\\-|\\-|\\+\\+|\\+|~|===|==|=|!=|!==|<=|>=|<<=|>>=|>>>=|<>|<|>|!|&&|\\|\\||\\?\\:|\\*=|%=|\\+=|\\-=|&=|\\^=|\\b(?:in|instanceof|new|delete|typeof|void)"
                }, {
                    token : "lparen",
                    regex : "[[({]"
                }, {
                    token : "rparen",
                    regex : "[\\])}]"
                }, {
                    token : "text",
                    regex : "\\s+"
                }
            ],
            "comment" : [
                {
                    token : "comment", // closing comment
                    regex : ".*?\\*\\/",
                    next : "start"
                }, {
                    token : "comment", // comment spanning whole line
                    regex : ".+"
                }
            ],
            "qqstring" : [
                {
                    token : "constant.language.escape",
                    regex : /\\(?:u[0-9A-Fa-f]{4}|.|$)/
                }, {
                    token : "constant.language.escape",
                    regex : /\$[\w\d]+/
                }, {
                    token : "constant.language.escape",
                    regex : /\$\{[^"\}]+\}?/
                }, {
                    token : "string",
                    regex : '"{3,5}',
                    next : "start"
                }, {
                    token : "string",
                    regex : '.+?'
                }
            ],
            "qstring" : [
                {
                    token : "constant.language.escape",
                    regex : /\\(?:u[0-9A-Fa-f]{4}|.|$)/
                }, {
                    token : "string",
                    regex : "'{3,5}",
                    next : "start"
                }, {
                    token : "string",
                    regex : ".+?"
                }
            ]
        };

        this.embedRules(DocCommentHighlightRules, "doc-",
            [ DocCommentHighlightRules.getEndRule("start") ]);

    };

    oop.inherits(GroovyHighlightRules, TextHighlightRules);

    exports.GroovyHighlightRules = GroovyHighlightRules;
});

ace.define('ace/mode/matching_brace_outdent', ['require', 'exports', 'module' , 'ace/range'], function (require, exports, module) {


   var Range = require("../range").Range;

   var MatchingBraceOutdent = function () {
   };

   (function () {

      this.checkOutdent = function (line, input) {
         if (!/^\s+$/.test(line))
            return false;

         return /^\s*\}/.test(input);
      };

      this.autoOutdent = function (doc, row) {
         var line = doc.getLine(row);
         var match = line.match(/^(\s*\})/);

         if (!match) return 0;

         var column = match[1].length;
         var openBracePos = doc.findMatchingBracket({row: row, column: column});

         if (!openBracePos || openBracePos.row == row) return 0;

         var indent = this.$getIndent(doc.getLine(openBracePos.row));
         doc.replace(new Range(row, 0, row, column - 1), indent);
      };

      this.$getIndent = function (line) {
         var match = line.match(/^(\s+)/);
         if (match) {
            return match[1];
         }

         return "";
      };

   }).call(MatchingBraceOutdent.prototype);

   exports.MatchingBraceOutdent = MatchingBraceOutdent;
});

ace.define('ace/mode/behaviour/cstyle', ['require', 'exports', 'module' , 'ace/lib/oop', 'ace/mode/behaviour', 'ace/token_iterator'], function (require, exports, module) {


    var oop = require("../../lib/oop");
    var Behaviour = require("../behaviour").Behaviour;
    var TokenIterator = require("../../token_iterator").TokenIterator;
    var lang = require("../../lib/lang");

    var SAFE_INSERT_IN_TOKENS =
        ["text", "paren.rparen", "punctuation.operator"];
    var SAFE_INSERT_BEFORE_TOKENS =
        ["text", "paren.rparen", "punctuation.operator", "comment"];

    var context;
    var contextCache = {};
    var initContext = function(editor) {
        var id = -1;
        if (editor.multiSelect) {
            id = editor.selection.index;
            if (contextCache.rangeCount != editor.multiSelect.rangeCount)
                contextCache = {rangeCount: editor.multiSelect.rangeCount};
        }
        if (contextCache[id])
            return context = contextCache[id];
        context = contextCache[id] = {
            autoInsertedBrackets: 0,
            autoInsertedRow: -1,
            autoInsertedLineEnd: "",
            maybeInsertedBrackets: 0,
            maybeInsertedRow: -1,
            maybeInsertedLineStart: "",
            maybeInsertedLineEnd: ""
        };
    };

    var getWrapped = function(selection, selected, opening, closing) {
        var rowDiff = selection.end.row - selection.start.row;
        return {
            text: opening + selected + closing,
            selection: [
                0,
                selection.start.column + 1,
                rowDiff,
                selection.end.column + (rowDiff ? 0 : 1)
            ]
        };
    };

    var CstyleBehaviour = function() {
        this.add("braces", "insertion", function(state, action, editor, session, text) {
            var cursor = editor.getCursorPosition();
            var line = session.doc.getLine(cursor.row);
            if (text == '{') {
                initContext(editor);
                var selection = editor.getSelectionRange();
                var selected = session.doc.getTextRange(selection);
                if (selected !== "" && selected !== "{" && editor.getWrapBehavioursEnabled()) {
                    return getWrapped(selection, selected, '{', '}');
                } else if (CstyleBehaviour.isSaneInsertion(editor, session)) {
                    if (/[\]\}\)]/.test(line[cursor.column]) || editor.inMultiSelectMode) {
                        CstyleBehaviour.recordAutoInsert(editor, session, "}");
                        return {
                            text: '{}',
                            selection: [1, 1]
                        };
                    } else {
                        CstyleBehaviour.recordMaybeInsert(editor, session, "{");
                        return {
                            text: '{',
                            selection: [1, 1]
                        };
                    }
                }
            } else if (text == '}') {
                initContext(editor);
                var rightChar = line.substring(cursor.column, cursor.column + 1);
                if (rightChar == '}') {
                    var matching = session.$findOpeningBracket('}', {column: cursor.column + 1, row: cursor.row});
                    if (matching !== null && CstyleBehaviour.isAutoInsertedClosing(cursor, line, text)) {
                        CstyleBehaviour.popAutoInsertedClosing();
                        return {
                            text: '',
                            selection: [1, 1]
                        };
                    }
                }
            } else if (text == "\n" || text == "\r\n") {
                initContext(editor);
                var closing = "";
                if (CstyleBehaviour.isMaybeInsertedClosing(cursor, line)) {
                    closing = lang.stringRepeat("}", context.maybeInsertedBrackets);
                    CstyleBehaviour.clearMaybeInsertedClosing();
                }
                var rightChar = line.substring(cursor.column, cursor.column + 1);
                if (rightChar === '}') {
                    var openBracePos = session.findMatchingBracket({row: cursor.row, column: cursor.column+1}, '}');
                    if (!openBracePos)
                        return null;
                    var next_indent = this.$getIndent(session.getLine(openBracePos.row));
                } else if (closing) {
                    var next_indent = this.$getIndent(line);
                } else {
                    CstyleBehaviour.clearMaybeInsertedClosing();
                    return;
                }
                var indent = next_indent + session.getTabString();

                return {
                    text: '\n' + indent + '\n' + next_indent + closing,
                    selection: [1, indent.length, 1, indent.length]
                };
            } else {
                CstyleBehaviour.clearMaybeInsertedClosing();
            }
        });

        this.add("braces", "deletion", function(state, action, editor, session, range) {
            var selected = session.doc.getTextRange(range);
            if (!range.isMultiLine() && selected == '{') {
                initContext(editor);
                var line = session.doc.getLine(range.start.row);
                var rightChar = line.substring(range.end.column, range.end.column + 1);
                if (rightChar == '}') {
                    range.end.column++;
                    return range;
                } else {
                    context.maybeInsertedBrackets--;
                }
            }
        });

        this.add("parens", "insertion", function(state, action, editor, session, text) {
            if (text == '(') {
                initContext(editor);
                var selection = editor.getSelectionRange();
                var selected = session.doc.getTextRange(selection);
                if (selected !== "" && editor.getWrapBehavioursEnabled()) {
                    return getWrapped(selection, selected, '(', ')');
                } else if (CstyleBehaviour.isSaneInsertion(editor, session)) {
                    CstyleBehaviour.recordAutoInsert(editor, session, ")");
                    return {
                        text: '()',
                        selection: [1, 1]
                    };
                }
            } else if (text == ')') {
                initContext(editor);
                var cursor = editor.getCursorPosition();
                var line = session.doc.getLine(cursor.row);
                var rightChar = line.substring(cursor.column, cursor.column + 1);
                if (rightChar == ')') {
                    var matching = session.$findOpeningBracket(')', {column: cursor.column + 1, row: cursor.row});
                    if (matching !== null && CstyleBehaviour.isAutoInsertedClosing(cursor, line, text)) {
                        CstyleBehaviour.popAutoInsertedClosing();
                        return {
                            text: '',
                            selection: [1, 1]
                        };
                    }
                }
            }
        });

        this.add("parens", "deletion", function(state, action, editor, session, range) {
            var selected = session.doc.getTextRange(range);
            if (!range.isMultiLine() && selected == '(') {
                initContext(editor);
                var line = session.doc.getLine(range.start.row);
                var rightChar = line.substring(range.start.column + 1, range.start.column + 2);
                if (rightChar == ')') {
                    range.end.column++;
                    return range;
                }
            }
        });

        this.add("brackets", "insertion", function(state, action, editor, session, text) {
            if (text == '[') {
                initContext(editor);
                var selection = editor.getSelectionRange();
                var selected = session.doc.getTextRange(selection);
                if (selected !== "" && editor.getWrapBehavioursEnabled()) {
                    return getWrapped(selection, selected, '[', ']');
                } else if (CstyleBehaviour.isSaneInsertion(editor, session)) {
                    CstyleBehaviour.recordAutoInsert(editor, session, "]");
                    return {
                        text: '[]',
                        selection: [1, 1]
                    };
                }
            } else if (text == ']') {
                initContext(editor);
                var cursor = editor.getCursorPosition();
                var line = session.doc.getLine(cursor.row);
                var rightChar = line.substring(cursor.column, cursor.column + 1);
                if (rightChar == ']') {
                    var matching = session.$findOpeningBracket(']', {column: cursor.column + 1, row: cursor.row});
                    if (matching !== null && CstyleBehaviour.isAutoInsertedClosing(cursor, line, text)) {
                        CstyleBehaviour.popAutoInsertedClosing();
                        return {
                            text: '',
                            selection: [1, 1]
                        };
                    }
                }
            }
        });

        this.add("brackets", "deletion", function(state, action, editor, session, range) {
            var selected = session.doc.getTextRange(range);
            if (!range.isMultiLine() && selected == '[') {
                initContext(editor);
                var line = session.doc.getLine(range.start.row);
                var rightChar = line.substring(range.start.column + 1, range.start.column + 2);
                if (rightChar == ']') {
                    range.end.column++;
                    return range;
                }
            }
        });

        this.add("string_dquotes", "insertion", function(state, action, editor, session, text) {
            if (text == '"' || text == "'") {
                if (this.lineCommentStart && this.lineCommentStart.indexOf(text) != -1)
                    return;
                initContext(editor);
                var quote = text;
                var selection = editor.getSelectionRange();
                var selected = session.doc.getTextRange(selection);
                if (selected !== "" && selected !== "'" && selected != '"' && editor.getWrapBehavioursEnabled()) {
                    return getWrapped(selection, selected, quote, quote);
                } else if (!selected) {
                    var cursor = editor.getCursorPosition();
                    var line = session.doc.getLine(cursor.row);
                    var leftChar = line.substring(cursor.column-1, cursor.column);
                    var rightChar = line.substring(cursor.column, cursor.column + 1);

                    var token = session.getTokenAt(cursor.row, cursor.column);
                    var rightToken = session.getTokenAt(cursor.row, cursor.column + 1);
                    // We're escaped.
                    if (leftChar == "\\" && token && /escape/.test(token.type))
                        return null;

                    var stringBefore = token && /string|escape/.test(token.type);
                    var stringAfter = !rightToken || /string|escape/.test(rightToken.type);

                    var pair;
                    if (rightChar == quote) {
                        pair = stringBefore !== stringAfter;
                    } else {
                        if (stringBefore && !stringAfter)
                            return null; // wrap string with different quote
                        if (stringBefore && stringAfter)
                            return null; // do not pair quotes inside strings
                        var wordRe = session.$mode.tokenRe;
                        wordRe.lastIndex = 0;
                        var isWordBefore = wordRe.test(leftChar);
                        wordRe.lastIndex = 0;
                        var isWordAfter = wordRe.test(leftChar);
                        if (isWordBefore || isWordAfter)
                            return null; // before or after alphanumeric
                        if (rightChar && !/[\s;,.})\]\\]/.test(rightChar))
                            return null; // there is rightChar and it isn't closing
                        pair = true;
                    }
                    return {
                        text: pair ? quote + quote : "",
                        selection: [1,1]
                    };
                }
            }
        });

        this.add("string_dquotes", "deletion", function(state, action, editor, session, range) {
            var selected = session.doc.getTextRange(range);
            if (!range.isMultiLine() && (selected == '"' || selected == "'")) {
                initContext(editor);
                var line = session.doc.getLine(range.start.row);
                var rightChar = line.substring(range.start.column + 1, range.start.column + 2);
                if (rightChar == selected) {
                    range.end.column++;
                    return range;
                }
            }
        });

    };


    CstyleBehaviour.isSaneInsertion = function(editor, session) {
        var cursor = editor.getCursorPosition();
        var iterator = new TokenIterator(session, cursor.row, cursor.column);

        // Don't insert in the middle of a keyword/identifier/lexical
        if (!this.$matchTokenType(iterator.getCurrentToken() || "text", SAFE_INSERT_IN_TOKENS)) {
            // Look ahead in case we're at the end of a token
            var iterator2 = new TokenIterator(session, cursor.row, cursor.column + 1);
            if (!this.$matchTokenType(iterator2.getCurrentToken() || "text", SAFE_INSERT_IN_TOKENS))
                return false;
        }

        // Only insert in front of whitespace/comments
        iterator.stepForward();
        return iterator.getCurrentTokenRow() !== cursor.row ||
            this.$matchTokenType(iterator.getCurrentToken() || "text", SAFE_INSERT_BEFORE_TOKENS);
    };

    CstyleBehaviour.$matchTokenType = function(token, types) {
        return types.indexOf(token.type || token) > -1;
    };

    CstyleBehaviour.recordAutoInsert = function(editor, session, bracket) {
        var cursor = editor.getCursorPosition();
        var line = session.doc.getLine(cursor.row);
        // Reset previous state if text or context changed too much
        if (!this.isAutoInsertedClosing(cursor, line, context.autoInsertedLineEnd[0]))
            context.autoInsertedBrackets = 0;
        context.autoInsertedRow = cursor.row;
        context.autoInsertedLineEnd = bracket + line.substr(cursor.column);
        context.autoInsertedBrackets++;
    };

    CstyleBehaviour.recordMaybeInsert = function(editor, session, bracket) {
        var cursor = editor.getCursorPosition();
        var line = session.doc.getLine(cursor.row);
        if (!this.isMaybeInsertedClosing(cursor, line))
            context.maybeInsertedBrackets = 0;
        context.maybeInsertedRow = cursor.row;
        context.maybeInsertedLineStart = line.substr(0, cursor.column) + bracket;
        context.maybeInsertedLineEnd = line.substr(cursor.column);
        context.maybeInsertedBrackets++;
    };

    CstyleBehaviour.isAutoInsertedClosing = function(cursor, line, bracket) {
        return context.autoInsertedBrackets > 0 &&
            cursor.row === context.autoInsertedRow &&
            bracket === context.autoInsertedLineEnd[0] &&
            line.substr(cursor.column) === context.autoInsertedLineEnd;
    };

    CstyleBehaviour.isMaybeInsertedClosing = function(cursor, line) {
        return context.maybeInsertedBrackets > 0 &&
            cursor.row === context.maybeInsertedRow &&
            line.substr(cursor.column) === context.maybeInsertedLineEnd &&
            line.substr(0, cursor.column) == context.maybeInsertedLineStart;
    };

    CstyleBehaviour.popAutoInsertedClosing = function() {
        context.autoInsertedLineEnd = context.autoInsertedLineEnd.substr(1);
        context.autoInsertedBrackets--;
    };

    CstyleBehaviour.clearMaybeInsertedClosing = function() {
        if (context) {
            context.maybeInsertedBrackets = 0;
            context.maybeInsertedRow = -1;
        }
    };



    oop.inherits(CstyleBehaviour, Behaviour);

    exports.CstyleBehaviour = CstyleBehaviour;
});

ace.define('ace/mode/folding/cstyle', ['require', 'exports', 'module' , 'ace/lib/oop', 'ace/range', 'ace/mode/folding/fold_mode'], function (require, exports, module) {

    var oop = require("../../lib/oop");
    var Range = require("../../range").Range;
    var BaseFoldMode = require("./fold_mode").FoldMode;

    var FoldMode = exports.FoldMode = function(commentRegex) {
        if (commentRegex) {
            this.foldingStartMarker = new RegExp(
                this.foldingStartMarker.source.replace(/\|[^|]*?$/, "|" + commentRegex.start)
            );
            this.foldingStopMarker = new RegExp(
                this.foldingStopMarker.source.replace(/\|[^|]*?$/, "|" + commentRegex.end)
            );
        }
    };
    oop.inherits(FoldMode, BaseFoldMode);

    (function() {

        this.foldingStartMarker = /(\{|\[)[^\}\]]*$|^\s*(\/\*)/;
        this.foldingStopMarker = /^[^\[\{]*(\}|\])|^[\s\*]*(\*\/)/;
        this.singleLineBlockCommentRe= /^\s*(\/\*).*\*\/\s*$/;
        this.tripleStarBlockCommentRe = /^\s*(\/\*\*\*).*\*\/\s*$/;
        this.startRegionRe = /^\s*(\/\*|\/\/)#?region\b/;

        //prevent naming conflict with any modes that inherit from cstyle and override this (like csharp)
        this._getFoldWidgetBase = this.getFoldWidget;

        /**
         * Gets fold widget with some non-standard extras:
         *
         * @example lineCommentRegionStart
         *      //#region [optional description]
         *
         * @example blockCommentRegionStart
         *      /*#region [optional description] *[/]
         *
         * @example tripleStarFoldingSection
         *      /*** this folds even though 1 line because it has 3 stars ***[/]
         *
         * @note the pound symbol for region tags is optional
         */
        this.getFoldWidget = function(session, foldStyle, row) {
            var line = session.getLine(row);

            if (this.singleLineBlockCommentRe.test(line)) {
                // No widget for single line block comment unless region or triple star
                if (!this.startRegionRe.test(line) && !this.tripleStarBlockCommentRe.test(line))
                    return "";
            }

            var fw = this._getFoldWidgetBase(session, foldStyle, row);

            if (!fw && this.startRegionRe.test(line))
                return "start"; // lineCommentRegionStart

            return fw;
        };

        this.getFoldWidgetRange = function(session, foldStyle, row, forceMultiline) {
            var line = session.getLine(row);

            if (this.startRegionRe.test(line))
                return this.getCommentRegionBlock(session, line, row);

            var match = line.match(this.foldingStartMarker);
            if (match) {
                var i = match.index;

                if (match[1])
                    return this.openingBracketBlock(session, match[1], row, i);

                var range = session.getCommentFoldRange(row, i + match[0].length, 1);

                if (range && !range.isMultiLine()) {
                    if (forceMultiline) {
                        range = this.getSectionRange(session, row);
                    } else if (foldStyle != "all")
                        range = null;
                }

                return range;
            }

            if (foldStyle === "markbegin")
                return;

            var match = line.match(this.foldingStopMarker);
            if (match) {
                var i = match.index + match[0].length;

                if (match[1])
                    return this.closingBracketBlock(session, match[1], row, i);

                return session.getCommentFoldRange(row, i, -1);
            }
        };

        this.getSectionRange = function(session, row) {
            var line = session.getLine(row);
            var startIndent = line.search(/\S/);
            var startRow = row;
            var startColumn = line.length;
            row = row + 1;
            var endRow = row;
            var maxRow = session.getLength();
            while (++row < maxRow) {
                line = session.getLine(row);
                var indent = line.search(/\S/);
                if (indent === -1)
                    continue;
                if  (startIndent > indent)
                    break;
                var subRange = this.getFoldWidgetRange(session, "all", row);

                if (subRange) {
                    if (subRange.start.row <= startRow) {
                        break;
                    } else if (subRange.isMultiLine()) {
                        row = subRange.end.row;
                    } else if (startIndent == indent) {
                        break;
                    }
                }
                endRow = row;
            }

            return new Range(startRow, startColumn, endRow, session.getLine(endRow).length);
        };

        /**
         * gets comment region block with end region assumed to be start of comment in any cstyle mode or SQL mode (--) which inherits from this.
         * There may optionally be a pound symbol before the region/endregion statement
         */
        this.getCommentRegionBlock = function(session, line, row) {
            var startColumn = line.search(/\s*$/);
            var maxRow = session.getLength();
            var startRow = row;

            var re = /^\s*(?:\/\*|\/\/|--)#?(end)?region\b/;
            var depth = 1;
            while (++row < maxRow) {
                line = session.getLine(row);
                var m = re.exec(line);
                if (!m) continue;
                if (m[1]) depth--;
                else depth++;

                if (!depth) break;
            }

            var endRow = row;
            if (endRow > startRow) {
                return new Range(startRow, startColumn, endRow, line.length);
            }
        };

    }).call(FoldMode.prototype);

});


ace.define('ace/mode/text_highlight_rules', ['require', 'exports', 'module' , 'ace/lib/lang'], function (require, exports, module) {

   var lang = require("../lib/lang");

   var TextHighlightRules = function() {

      // regexp must not have capturing parentheses
      // regexps are ordered -> the first match is used

      this.$rules = {
         "start" : [{
            token : "empty_line",
            regex : '^$'
         }, {
            defaultToken : "text"
         }]
      };
   };

   (function() {

      this.addRules = function(rules, prefix) {
         if (!prefix) {
            for (var key in rules)
               this.$rules[key] = rules[key];
            return;
         }
         for (var key in rules) {
            var state = rules[key];
            for (var i = 0; i < state.length; i++) {
               var rule = state[i];
               if (rule.next || rule.onMatch) {
                  if (typeof rule.next == "string") {
                     if (rule.next.indexOf(prefix) !== 0)
                        rule.next = prefix + rule.next;
                  }
                  if (rule.nextState && rule.nextState.indexOf(prefix) !== 0)
                     rule.nextState = prefix + rule.nextState;
               }
            }
            this.$rules[prefix + key] = state;
         }
      };

      this.getRules = function() {
         return this.$rules;
      };

      this.embedRules = function (HighlightRules, prefix, escapeRules, states, append) {
         var embedRules = typeof HighlightRules == "function"
             ? new HighlightRules().getRules()
             : HighlightRules;
         if (states) {
            for (var i = 0; i < states.length; i++)
               states[i] = prefix + states[i];
         } else {
            states = [];
            for (var key in embedRules)
               states.push(prefix + key);
         }

         this.addRules(embedRules, prefix);

         if (escapeRules) {
            var addRules = Array.prototype[append ? "push" : "unshift"];
            for (var i = 0; i < states.length; i++)
               addRules.apply(this.$rules[states[i]], lang.deepCopy(escapeRules));
         }

         if (!this.$embeds)
            this.$embeds = [];
         this.$embeds.push(prefix);
      };

      this.getEmbeds = function() {
         return this.$embeds;
      };

      var pushState = function(currentState, stack) {
         if (currentState != "start" || stack.length)
            stack.unshift(this.nextState, currentState);
         return this.nextState;
      };
      var popState = function(currentState, stack) {
         // if (stack[0] === currentState)
         stack.shift();
         return stack.shift() || "start";
      };

      this.normalizeRules = function() {
         var id = 0;
         var rules = this.$rules;
         function processState(key) {
            var state = rules[key];
            state.processed = true;
            for (var i = 0; i < state.length; i++) {
               var rule = state[i];
               var toInsert = null;
               if (Array.isArray(rule)) {
                  toInsert = rule;
                  rule = {};
               }
               if (!rule.regex && rule.start) {
                  rule.regex = rule.start;
                  if (!rule.next)
                     rule.next = [];
                  rule.next.push({
                     defaultToken: rule.token
                  }, {
                     token: rule.token + ".end",
                     regex: rule.end || rule.start,
                     next: "pop"
                  });
                  rule.token = rule.token + ".start";
                  rule.push = true;
               }
               var next = rule.next || rule.push;
               if (next && Array.isArray(next)) {
                  var stateName = rule.stateName;
                  if (!stateName)  {
                     stateName = rule.token;
                     if (typeof stateName != "string")
                        stateName = stateName[0] || "";
                     if (rules[stateName])
                        stateName += id++;
                  }
                  rules[stateName] = next;
                  rule.next = stateName;
                  processState(stateName);
               } else if (next == "pop") {
                  rule.next = popState;
               }

               if (rule.push) {
                  rule.nextState = rule.next || rule.push;
                  rule.next = pushState;
                  delete rule.push;
               }

               if (rule.rules) {
                  for (var r in rule.rules) {
                     if (rules[r]) {
                        if (rules[r].push)
                           rules[r].push.apply(rules[r], rule.rules[r]);
                     } else {
                        rules[r] = rule.rules[r];
                     }
                  }
               }
               var includeName = typeof rule == "string"
                   ? rule
                   : typeof rule.include == "string"
                   ? rule.include
                   : "";
               if (includeName) {
                  toInsert = rules[includeName];
               }

               if (toInsert) {
                  var args = [i, 1].concat(toInsert);
                  if (rule.noEscape)
                     args = args.filter(function(x) {return !x.next;});
                  state.splice.apply(state, args);
                  // skip included rules since they are already processed
                  //i += args.length - 3;
                  i--;
               }

               if (rule.keywordMap) {
                  rule.token = this.createKeywordMapper(
                      rule.keywordMap, rule.defaultToken || "text", rule.caseInsensitive
                  );
                  delete rule.defaultToken;
               }
            }
         }
         Object.keys(rules).forEach(processState, this);
      };

      this.createKeywordMapper = function(map, defaultToken, ignoreCase, splitChar) {
         var keywords = Object.create(null);
         Object.keys(map).forEach(function(className) {
            var a = map[className];
            if (ignoreCase)
               a = a.toLowerCase();
            var list = a.split(splitChar || "|");
            for (var i = list.length; i--; )
               keywords[list[i]] = className;
         });
         // in old versions of opera keywords["__proto__"] sets prototype
         // even on objects with __proto__=null
         if (Object.getPrototypeOf(keywords)) {
            keywords.__proto__ = null;
         }
         this.$keywordList = Object.keys(keywords);
         map = null;
         return ignoreCase
             ? function(value) {return keywords[value.toLowerCase()] || defaultToken }
             : function(value) {return keywords[value] || defaultToken };
      };

      this.getKeywords = function() {
         return this.$keywords;
      };

   }).call(TextHighlightRules.prototype);

   exports.TextHighlightRules = TextHighlightRules;
});

ace.define('ace/mode/doc_comment_highlight_rules', ['require', 'exports', 'module' , 'ace/lib/oop', 'ace/mode/text_highlight_rules'], function (require, exports, module) {
   var oop = require("../lib/oop");
   var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

   var DocCommentHighlightRules = function() {
      this.$rules = {
         "start" : [ {
            token : "comment.doc.tag",
            regex : "@[\\w\\d_]+" // TODO: fix email addresses
         },
            DocCommentHighlightRules.getTagRule()/*,
            {
               defaultToken : "comment.doc",
               caseInsensitive: true
            }*/]
      };
   };

   oop.inherits(DocCommentHighlightRules, TextHighlightRules);

   DocCommentHighlightRules.getTagRule = function(start) {
      return {
         token : "comment.doc.tag.storage.type",
         regex : "\\b(?:TODO|FIXME|XXX|HACK)\\b"
      };
   }

   DocCommentHighlightRules.getStartRule = function(start) {
      return {
         token : "comment.doc", // doc comment
         regex : "\\/\\*(?=\\*)",
         next  : start
      };
   };

   DocCommentHighlightRules.getEndRule = function (start) {
      return {
         token : "comment.doc", // closing comment
         regex : "\\*\\/",
         next  : start
      };
   };


   exports.DocCommentHighlightRules = DocCommentHighlightRules;

});



ace.define('ace/mode/text', ['require', 'exports', 'module' , 'ace/lib/oop', 'ace/mode/text_highlight_rules'], function (require, exports, module) {


    var Tokenizer = require("../tokenizer").Tokenizer;
    var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;
    var CstyleBehaviour = require("./behaviour/cstyle").CstyleBehaviour;
    var unicode = require("../unicode");
    var lang = require("../lib/lang");
    var TokenIterator = require("../token_iterator").TokenIterator;
    var Range = require("../range").Range;

    var Mode = function() {
        this.HighlightRules = TextHighlightRules;
    };

    (function() {
        this.$behaviour = new CstyleBehaviour();

        this.tokenRe = new RegExp("^["
            + unicode.packages.L
            + unicode.packages.Mn + unicode.packages.Mc
            + unicode.packages.Nd
            + unicode.packages.Pc + "\\$_]+", "g"
        );

        this.nonTokenRe = new RegExp("^(?:[^"
            + unicode.packages.L
            + unicode.packages.Mn + unicode.packages.Mc
            + unicode.packages.Nd
            + unicode.packages.Pc + "\\$_]|\\s])+", "g"
        );

        this.getTokenizer = function() {
            if (!this.$tokenizer) {
                this.$highlightRules = this.$highlightRules || new this.HighlightRules(this.$highlightRuleConfig);
                this.$tokenizer = new Tokenizer(this.$highlightRules.getRules());
            }
            return this.$tokenizer;
        };

        this.lineCommentStart = "";
        this.blockComment = "";

        this.toggleCommentLines = function(state, session, startRow, endRow) {
            var doc = session.doc;

            var ignoreBlankLines = true;
            var shouldRemove = true;
            var minIndent = Infinity;
            var tabSize = session.getTabSize();
            var insertAtTabStop = false;

            if (!this.lineCommentStart) {
                if (!this.blockComment)
                    return false;
                var lineCommentStart = this.blockComment.start;
                var lineCommentEnd = this.blockComment.end;
                var regexpStart = new RegExp("^(\\s*)(?:" + lang.escapeRegExp(lineCommentStart) + ")");
                var regexpEnd = new RegExp("(?:" + lang.escapeRegExp(lineCommentEnd) + ")\\s*$");

                var comment = function(line, i) {
                    if (testRemove(line, i))
                        return;
                    if (!ignoreBlankLines || /\S/.test(line)) {
                        doc.insertInLine({row: i, column: line.length}, lineCommentEnd);
                        doc.insertInLine({row: i, column: minIndent}, lineCommentStart);
                    }
                };

                var uncomment = function(line, i) {
                    var m;
                    if (m = line.match(regexpEnd))
                        doc.removeInLine(i, line.length - m[0].length, line.length);
                    if (m = line.match(regexpStart))
                        doc.removeInLine(i, m[1].length, m[0].length);
                };

                var testRemove = function(line, row) {
                    if (regexpStart.test(line))
                        return true;
                    var tokens = session.getTokens(row);
                    for (var i = 0; i < tokens.length; i++) {
                        if (tokens[i].type === "comment")
                            return true;
                    }
                };
            } else {
                if (Array.isArray(this.lineCommentStart)) {
                    var regexpStart = this.lineCommentStart.map(lang.escapeRegExp).join("|");
                    var lineCommentStart = this.lineCommentStart[0];
                } else {
                    var regexpStart = lang.escapeRegExp(this.lineCommentStart);
                    var lineCommentStart = this.lineCommentStart;
                }
                regexpStart = new RegExp("^(\\s*)(?:" + regexpStart + ") ?");

                insertAtTabStop = session.getUseSoftTabs();

                var uncomment = function(line, i) {
                    var m = line.match(regexpStart);
                    if (!m) return;
                    var start = m[1].length, end = m[0].length;
                    if (!shouldInsertSpace(line, start, end) && m[0][end - 1] == " ")
                        end--;
                    doc.removeInLine(i, start, end);
                };
                var commentWithSpace = lineCommentStart + " ";
                var comment = function(line, i) {
                    if (!ignoreBlankLines || /\S/.test(line)) {
                        if (shouldInsertSpace(line, minIndent, minIndent))
                            doc.insertInLine({row: i, column: minIndent}, commentWithSpace);
                        else
                            doc.insertInLine({row: i, column: minIndent}, lineCommentStart);
                    }
                };
                var testRemove = function(line, i) {
                    return regexpStart.test(line);
                };

                var shouldInsertSpace = function(line, before, after) {
                    var spaces = 0;
                    while (before-- && line.charAt(before) == " ")
                        spaces++;
                    if (spaces % tabSize != 0)
                        return false;
                    var spaces = 0;
                    while (line.charAt(after++) == " ")
                        spaces++;
                    if (tabSize > 2)
                        return spaces % tabSize != tabSize - 1;
                    else
                        return spaces % tabSize == 0;
                    return true;
                };
            }

            function iter(fun) {
                for (var i = startRow; i <= endRow; i++)
                    fun(doc.getLine(i), i);
            }


            var minEmptyLength = Infinity;
            iter(function(line, i) {
                var indent = line.search(/\S/);
                if (indent !== -1) {
                    if (indent < minIndent)
                        minIndent = indent;
                    if (shouldRemove && !testRemove(line, i))
                        shouldRemove = false;
                } else if (minEmptyLength > line.length) {
                    minEmptyLength = line.length;
                }
            });

            if (minIndent == Infinity) {
                minIndent = minEmptyLength;
                ignoreBlankLines = false;
                shouldRemove = false;
            }

            if (insertAtTabStop && minIndent % tabSize != 0)
                minIndent = Math.floor(minIndent / tabSize) * tabSize;

            iter(shouldRemove ? uncomment : comment);
        };

        this.toggleBlockComment = function(state, session, range, cursor) {
            var comment = this.blockComment;
            if (!comment)
                return;
            if (!comment.start && comment[0])
                comment = comment[0];

            var iterator = new TokenIterator(session, cursor.row, cursor.column);
            var token = iterator.getCurrentToken();

            var sel = session.selection;
            var initialRange = session.selection.toOrientedRange();
            var startRow, colDiff;

            if (token && /comment/.test(token.type)) {
                var startRange, endRange;
                while (token && /comment/.test(token.type)) {
                    var i = token.value.indexOf(comment.start);
                    if (i != -1) {
                        var row = iterator.getCurrentTokenRow();
                        var column = iterator.getCurrentTokenColumn() + i;
                        startRange = new Range(row, column, row, column + comment.start.length);
                        break;
                    }
                    token = iterator.stepBackward();
                }

                var iterator = new TokenIterator(session, cursor.row, cursor.column);
                var token = iterator.getCurrentToken();
                while (token && /comment/.test(token.type)) {
                    var i = token.value.indexOf(comment.end);
                    if (i != -1) {
                        var row = iterator.getCurrentTokenRow();
                        var column = iterator.getCurrentTokenColumn() + i;
                        endRange = new Range(row, column, row, column + comment.end.length);
                        break;
                    }
                    token = iterator.stepForward();
                }
                if (endRange)
                    session.remove(endRange);
                if (startRange) {
                    session.remove(startRange);
                    startRow = startRange.start.row;
                    colDiff = -comment.start.length;
                }
            } else {
                colDiff = comment.start.length;
                startRow = range.start.row;
                session.insert(range.end, comment.end);
                session.insert(range.start, comment.start);
            }
            // todo: selection should have ended up in the right place automatically!
            if (initialRange.start.row == startRow)
                initialRange.start.column += colDiff;
            if (initialRange.end.row == startRow)
                initialRange.end.column += colDiff;
            session.selection.fromOrientedRange(initialRange);
        };

        this.getNextLineIndent = function(state, line, tab) {
            return this.$getIndent(line);
        };

        this.checkOutdent = function(state, line, input) {
            return false;
        };

        this.autoOutdent = function(state, doc, row) {
        };

        this.$getIndent = function(line) {
            return line.match(/^\s*/)[0];
        };

        this.createWorker = function(session) {
            return null;
        };

        this.createModeDelegates = function (mapping) {
            this.$embeds = [];
            this.$modes = {};
            for (var i in mapping) {
                if (mapping[i]) {
                    this.$embeds.push(i);
                    this.$modes[i] = new mapping[i]();
                }
            }

            var delegations = ["toggleBlockComment", "toggleCommentLines", "getNextLineIndent",
                "checkOutdent", "autoOutdent", "transformAction", "getCompletions"];

            for (var i = 0; i < delegations.length; i++) {
                (function(scope) {
                    var functionName = delegations[i];
                    var defaultHandler = scope[functionName];
                    scope[delegations[i]] = function() {
                        return this.$delegator(functionName, arguments, defaultHandler);
                    };
                }(this));
            }
        };

        this.$delegator = function(method, args, defaultHandler) {
            var state = args[0];
            if (typeof state != "string")
                state = state[0];
            for (var i = 0; i < this.$embeds.length; i++) {
                if (!this.$modes[this.$embeds[i]]) continue;

                var split = state.split(this.$embeds[i]);
                if (!split[0] && split[1]) {
                    args[0] = split[1];
                    var mode = this.$modes[this.$embeds[i]];
                    return mode[method].apply(mode, args);
                }
            }
            var ret = defaultHandler.apply(this, args);
            return defaultHandler ? ret : undefined;
        };

        this.transformAction = function(state, action, editor, session, param) {
            if (this.$behaviour) {
                var behaviours = this.$behaviour.getBehaviours();
                for (var key in behaviours) {
                    if (behaviours[key][action]) {
                        var ret = behaviours[key][action].apply(this, arguments);
                        if (ret) {
                            return ret;
                        }
                    }
                }
            }
        };

        this.getKeywords = function(append) {
            // this is for autocompletion to pick up regexp'ed keywords
            if (!this.completionKeywords) {
                var rules = this.$tokenizer.rules;
                var completionKeywords = [];
                for (var rule in rules) {
                    var ruleItr = rules[rule];
                    for (var r = 0, l = ruleItr.length; r < l; r++) {
                        if (typeof ruleItr[r].token === "string") {
                            if (/keyword|support|storage/.test(ruleItr[r].token))
                                completionKeywords.push(ruleItr[r].regex);
                        }
                        else if (typeof ruleItr[r].token === "object") {
                            for (var a = 0, aLength = ruleItr[r].token.length; a < aLength; a++) {
                                if (/keyword|support|storage/.test(ruleItr[r].token[a])) {
                                    // drop surrounding parens
                                    var rule = ruleItr[r].regex.match(/\(.+?\)/g)[a];
                                    completionKeywords.push(rule.substr(1, rule.length - 2));
                                }
                            }
                        }
                    }
                }
                this.completionKeywords = completionKeywords;
            }
            // this is for highlighting embed rules, like HAML/Ruby or Obj-C/C
            if (!append)
                return this.$keywordList;
            return completionKeywords.concat(this.$keywordList || []);
        };

        this.$createKeywordList = function() {
            if (!this.$highlightRules)
                this.getTokenizer();
            return this.$keywordList = this.$highlightRules.$keywordList || [];
        };

        this.getCompletions = function(state, session, pos, prefix) {
            var keywords = this.$keywordList || this.$createKeywordList();
            return keywords.map(function(word) {
                return {
                    name: word,
                    value: word,
                    score: 0,
                    meta: "keyword"
                };
            });
        };

        this.$id = "ace/mode/text";
    }).call(Mode.prototype);

    exports.Mode = Mode;
});

