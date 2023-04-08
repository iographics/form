(function webpackUniversalModuleDefinition(root, factory) {
  if (typeof exports === "object" && typeof module === "object")
    module.exports = factory();
  else if (typeof define === "function" && define.amd)
    define([], factory);
  else if (typeof exports === "object")
    exports["for-widgets-server"] = factory();
  else
    root["for-widgets-server"] = factory();
})(this, function() {
  return function() {
    "use strict";
    var __webpack_require__ = {};
    !function() {
      __webpack_require__.d = function(exports2, definition) {
        for (var key in definition) {
          if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports2, key)) {
            Object.defineProperty(exports2, key, { enumerable: true, get: definition[key] });
          }
        }
      };
    }();
    !function() {
      __webpack_require__.o = function(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
      };
    }();
    var __webpack_exports__ = {};
    __webpack_require__.d(__webpack_exports__, {
      "default": function() {
        return index;
      }
    });
    ;
    const injectPostMessage = () => {
      if (window.getIframeWindow === void 0) {
        window.getIframeWindow = function getIframeWindow2(iframeObject) {
          var doc;
          if (iframeObject.contentWindow) {
            return iframeObject.contentWindow;
          }
          if (iframeObject.window) {
            return iframeObject.window;
          }
          if (!doc && iframeObject.contentDocument) {
            doc = iframeObject.contentDocument;
          }
          if (!doc && iframeObject.document) {
            doc = iframeObject.document;
          }
          if (doc && doc.defaultView) {
            return doc.defaultView;
          }
          if (doc && doc.parentWindow) {
            return doc.parentWindow;
          }
        };
      }
      if (typeof window.XD === "undefined") {
        window.XD = function() {
          var interval_id;
          var last_hash;
          var cache_bust = 1;
          var attached_callback;
          return {
            postMessage: function(message, target_url, _target) {
              if (!target_url) {
                return;
              }
              let target = _target || window.parent;
              if (window.postMessage) {
                var postMessageTarget = target_url.replace(/([^:]+:\/\/[^/]+).*/, "$1");
                if (!("postMessage" in target)) {
                  target = window.getIframeWindow(target);
                }
                if (!target) {
                  return;
                }
                if (postMessageTarget.indexOf("file://") === 0) {
                  postMessageTarget = "*";
                }
                target.postMessage(message, postMessageTarget);
              } else if (target_url) {
                target.location = `${target_url.replace(/#.*$/, "")}#${+new Date()}${cache_bust++}&${message}`;
              }
            },
            receiveMessage: function(callback, source_origin) {
              if (window.postMessage) {
                if (callback) {
                  attached_callback = function(e) {
                    var params = window.location.search.split("?").join("");
                    var isOfflineForms = params.indexOf("offline_forms=true") > -1 || params.indexOf("offline_forms=si") > -1;
                    if (!isOfflineForms && (typeof source_origin === "string" && e.origin !== source_origin || Object.prototype.toString.call(source_origin) === "[object Function]" && source_origin(e.origin) === false)) {
                      return false;
                    }
                    callback(e);
                  };
                }
                if (window.addEventListener) {
                  window[callback ? "addEventListener" : "removeEventListener"]("message", attached_callback, false);
                } else {
                  window[callback ? "attachEvent" : "detachEvent"]("onmessage", attached_callback);
                }
              } else {
                if (interval_id) {
                  clearInterval(interval_id);
                }
                interval_id = null;
                if (callback) {
                  interval_id = setInterval(() => {
                    var { hash } = document.location;
                    var re = /^#?\d+&/;
                    if (hash !== last_hash && re.test(hash)) {
                      last_hash = hash;
                      callback({
                        data: hash.replace(re, "")
                      });
                    }
                  }, 100);
                }
              }
            }
          };
        }();
      }
    };
    ;
    const injectGetStyle = () => {
      function getStyle2(el, styleProp) {
        var value;
        var { defaultView } = el.ownerDocument || document;
        if (defaultView && defaultView.getComputedStyle) {
          styleProp = styleProp.replace(/([A-Z])/g, "-$1").toLowerCase();
          return defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
        }
        if (el.currentStyle) {
          styleProp = styleProp.replace(/-(\w)/g, (str, letter) => {
            return letter.toUpperCase();
          });
          value = el.currentStyle[styleProp];
          if (/^\d+(em|pt|%|ex)?$/i.test(value)) {
            return function(val) {
              var oldLeft = el.style.left;
              var oldRsLeft = el.runtimeStyle.left;
              el.runtimeStyle.left = el.currentStyle.left;
              el.style.left = val || 0;
              val = `${el.style.pixelLeft}px`;
              el.style.left = oldLeft;
              el.runtimeStyle.left = oldRsLeft;
              return val;
            }(value);
          }
          return value;
        }
      }
      if (!window.getStyle) {
        window.getStyle = getStyle2;
      }
    };
    ;
    const makeJCFServerCommonChecks = () => {
      if (window.JCFServerCommon === void 0) {
        window.JCFServerCommon = {
          frames: {},
          func: {}
        };
      }
    };
    ;
    function widgetAutoFill() {
      var isCardForm = !!window.CardForm;
      function parse(res) {
        window.$H(res).each((pair) => {
          var qid = pair.key;
          var question = pair.value;
          try {
            switch (question.type) {
              case "control_scale":
              case "control_radio":
                if (question.name == void 0) {
                  var radios = window.$window.$(`#id_${qid} input[type="radio"]`);
                } else {
                  var radios = document.getElementsByName(`q${qid}_${question.type == "control_radio" || question.type == "control_scale" ? question.name : qid}`);
                }
                window.$A(radios).each((rad) => {
                  if (rad.value == question.value) {
                    rad.checked = true;
                    rad.writeAttribute("checked", "checked");
                    triggerChangeEvent(rad);
                    rad.checked = true;
                  } else if (question.items.other != null) {
                    window.$(`other_${qid}`).checked = true;
                    window.$(`other_${qid}`).writeAttribute("checked", "checked");
                    window.$(`input_${qid}`).value = question.items.other;
                    triggerChangeEvent(window.$(`input_${qid}`));
                    window.$(`input_${qid}`).checked = true;
                  }
                });
                break;
              case "control_checkbox":
                var checks = window.$window.$(`#id_${qid} input[type="checkbox"]`);
                window.$A(checks).each((chk) => {
                  chk.checked = false;
                  chk.removeAttribute("checked");
                  if (Object.prototype.toString.call(question.items) === "[object Array]") {
                    if (question.items.include(chk.value)) {
                      chk.checked = true;
                      chk.writeAttribute("checked", "checked");
                      triggerChangeEvent(chk);
                      chk.checked = true;
                    }
                  } else {
                    if (Object.values(question.items).include(chk.value)) {
                      chk.checked = true;
                      chk.writeAttribute("checked", "checked");
                      triggerChangeEvent(chk);
                      chk.checked = true;
                    } else if (question.items.other != null) {
                      window.$(`other_${qid}`).checked = true;
                      window.$(`other_${qid}`).writeAttribute("checked", "checked");
                      window.$(`input_${qid}`).disabled = false;
                      window.$(`input_${qid}`).value = question.items.other;
                      triggerChangeEvent(chk);
                      window.$(`input_${qid}`).checked = true;
                    }
                  }
                });
                break;
              case "control_yesno":
                var radioInputs = window.$window.$(`#id_${qid} input[type="radio"]`);
                window.$A(radioInputs).each((radio) => {
                  if (radio.value === question.value) {
                    radio.checked = true;
                    radio.writeAttribute("checked", "checked");
                    triggerChangeEvent(radio);
                    radio.checked = true;
                  }
                });
                break;
              case "control_dropdown":
                var selectInput = window.$(`input_${qid}`);
                if (selectInput) {
                  if (isCardForm) {
                    var isMultiple = selectInput.up().querySelector("div.jfInput-dropdown").classList.contains("isMultiple");
                    if (isMultiple) {
                      var selectedOptionValues = question.items[0].split(",");
                      selectedOptionValues.forEach((eachValue) => {
                        selectInput.querySelector(`option[value="${eachValue}"]`).selected = true;
                      });
                    } else {
                      selectInput.putValue(question.value);
                    }
                  } else if (selectInput.hasAttribute("multiple")) {
                    var options = window.$window.$(`#id_${qid} option`);
                    window.$A(options).each((option) => {
                      if (question.items.include(option.value)) {
                        option.selected = true;
                      }
                    });
                  } else {
                    selectInput.putValue(question.value);
                  }
                  selectInput.triggerEvent("change");
                }
                break;
              case "control_rating":
                if (isCardForm) {
                  var element = document.getElementById(`input_${qid}_${question.value}`);
                  element.checked = true;
                  triggerChangeEvent(element);
                } else if (window.$(`input_${qid}`)) {
                  window.$(`input_${qid}`).setRating(question.value);
                }
                break;
              case "control_datetime":
              case "control_fullname":
                window.$H(question.items).each((item) => {
                  if (window.$(`${item.key}_${qid}`)) {
                    window.$(`${item.key}_${qid}`).value = item.value || "";
                    window.$(`${item.key}_${qid}`).triggerEvent("change");
                  }
                });
                if (window.$(`lite_mode_${qid}`)) {
                  var date = question.items;
                  if ("year" in date && "month" in date && "day" in date && date.year !== "" && date.month !== "" && date.day !== "") {
                    JotForm.formatDate({
                      date: new Date(date.year, date.month - 1, date.day),
                      dateField: window.$(`id_${qid}`)
                    });
                  }
                }
                break;
              case "control_emojislider":
                var cardWrapper = document.getElementById(`cid_${qid}`);
                var radioInputs = cardWrapper.querySelectorAll("input[type=radio]");
                var selectedIndex = 0;
                var radioInput;
                for (var i = 0; radioInput = radioInputs[i]; i++) {
                  if (radioInput.value === question.value) {
                    radioInput.checked = true;
                    selectedIndex = i;
                  }
                }
                var sliderWrapper = cardWrapper.querySelector(".js-emojiSlider");
                sliderWrapper.addClassName("isFilled");
                var sliderScaleList = sliderWrapper.querySelectorAll(".js-emojiScaleSep");
                var selectedScale = sliderScaleList[selectedIndex].getAttribute("data-scale");
                var faceListSlider = sliderWrapper.querySelector(".js-emojiSlider-faceList");
                faceListSlider.style.width = `${selectedScale}%`;
                var faces = faceListSlider.querySelectorAll(".js-emojiFaces");
                faces.forEach((eachFace) => {
                  eachFace.removeClassName("isVisible");
                });
                faces[selectedIndex].addClassName("isVisible");
                break;
              case "control_phone":
              case "control_birthdate":
              case "control_address":
              case "control_time":
                window.$H(question.items).each((item) => {
                  if (window.$(`input_${qid}_${item.key}`)) {
                    window.$(`input_${qid}_${item.key}`).putValue(item.value);
                  }
                });
                if (question.type === "control_time" && window.$(`input_${qid}_hourSelect`)) {
                  var hourSelect = question.items.hourSelect ? question.items.hourSelect : "";
                  if (hourSelect && window.$(`input_${qid}_hourSelect`).triggerEvent) {
                    if (window.$(`input_${qid}_timeInput`)) {
                      if (hourSelect.length === 1 && hourSelect < 10) {
                        hourSelect = `0${hourSelect}`;
                        window.$(`input_${qid}_hourSelect`).putValue(hourSelect);
                      }
                      var minuteSelect = window.$(`input_${qid}_minuteSelect`).value;
                      if (minuteSelect.length === 1 && minuteSelect < 10) {
                        minuteSelect = `0${minuteSelect}`;
                      }
                      window.$(`input_${qid}_timeInput`).putValue(`${hourSelect}:${minuteSelect}`);
                    } else {
                      if (hourSelect.length === 2 && hourSelect.charAt(0) == "0") {
                        hourSelect = hourSelect.slice(1);
                        window.$(`input_${qid}_hourSelect`).putValue(hourSelect);
                      }
                    }
                    window.$(`input_${qid}_hourSelect`).triggerEvent("change");
                  }
                }
                break;
              case "control_email":
                var emailInput = window.$(`input_${qid}`);
                if (emailInput) {
                  emailInput.putValue(question.value);
                  emailInput.triggerEvent("change");
                  var emailInputConfirm = window.$(`input_${qid}_confirm`);
                  if (emailInputConfirm) {
                    emailInputConfirm.putValue(question.value);
                    emailInputConfirm.triggerEvent("change");
                  }
                }
                break;
              case "control_textarea":
                if (question.value.length > 0) {
                  var input = window.$(`input_${qid}`);
                  if (input.up("div").down(".nicEdit-main") && nicEditors && nicEditors.findEditor(`input_${qid}`)) {
                    nicEditors.findEditor(`input_${qid}`).setContent(question.value);
                  }
                  input.putValue(question.value);
                  triggerChangeEvent(input);
                  if (isCardForm) {
                    Array.prototype.forEach.call(CardForm.cards, (card, index2) => {
                      if (card.question.id === qid && card.markdownEditor && card.markdownEditor.setHtmlFromMarkdown) {
                        card.markdownEditor.setHtmlFromMarkdown();
                      }
                    });
                  }
                  if (input.hasClassName("form-custom-hint")) {
                    input.removeClassName("form-custom-hint").removeAttribute("spellcheck");
                    input.hasContent = true;
                    input.run("focus");
                  }
                } else if (input.hasClassName("form-custom-hint")) {
                  input.run("blur");
                }
                break;
              default:
                if (window.$(`input_${qid}`)) {
                  window.$(`input_${qid}`).putValue(question.value);
                  window.$(`input_${qid}`).triggerEvent("change");
                }
                break;
            }
          } catch (e) {
          }
        });
      }
      function clear(res) {
        res.forEach((field) => {
          var { qid } = field;
          var question = window.$(`input_${qid}`);
          var { type } = field;
          switch (type) {
            case "control_scale":
            case "control_radio":
              var radios = window.$window.$(`#id_${qid} input[type="radio"]`);
              window.$A(radios).each((rad) => {
                rad.checked = false;
                rad.removeAttribute("checked");
                triggerChangeEvent(rad);
              });
              break;
            case "control_checkbox":
              var checks = window.$window.$(`#id_${qid} input[type="checkbox"]`);
              window.$A(checks).each((chk) => {
                chk.checked = false;
                chk.removeAttribute("checked");
                triggerChangeEvent(chk);
              });
              break;
            case "control_yesno":
              break;
            case "control_rating":
              if (isCardForm) {
                var radios = window.$window.$(`#id_${qid} input[type="radio"]`);
                window.$A(radios).each((rad) => {
                  if (rad.checked) {
                    rad.checked = false;
                    rad.click();
                  }
                });
                window.$window.$(`#id_${qid} li`).invoke("removeClassName", "checked");
                window.$window.$(`#id_${qid} input[type="hidden"]`).last().putValue("");
              } else {
                window.$(`input_${qid}`).setRating("");
              }
              break;
            case "control_datetime":
            case "control_fullname":
              window.$window.$(`input[id*=_${qid}]`).each((input) => {
                input.putValue("");
              });
              break;
            case "control_emojislider":
              break;
            case "control_phone":
            case "control_birthdate":
            case "control_address":
            case "control_time":
              window.$window.$(`[id*=input_${qid}]`).each((input) => {
                input.putValue("");
              });
              if (type === "control_time" && window.$(`input_${qid}_hourSelect`) && window.$(`input_${qid}_hourSelect`).triggerEvent) {
                window.$(`input_${qid}_hourSelect`).triggerEvent("change");
              }
              break;
            case "control_email":
            case "control_textarea":
            case "control_dropdown":
            default:
              if (question) {
                question.putValue("");
                question.triggerEvent("change");
                if (type === "control_email") {
                  var emailInputConfirm = window.$(`input_${qid}_confirm`);
                  if (emailInputConfirm) {
                    emailInputConfirm.putValue("");
                    emailInputConfirm.triggerEvent("change");
                  }
                }
              }
              break;
          }
        });
      }
      function triggerChangeEvent(field) {
        if (field.type && field.type.match(/checkbox|radio/)) {
          var posX = window.scrollX;
          var posY = window.scrollY;
          [
            "click",
            "change"
          ].forEach((e) => {
            field.triggerEvent(e);
          });
          if (posY !== window.scrollY) {
            window.scrollTo(posX, posY);
          }
          return;
        }
        field.triggerEvent("change");
      }
      function generateCtrlItems(qtype, value) {
        var items = {};
        value = `${value}`;
        switch (qtype) {
          case "control_fullname":
            var name = value.replace(/^\s+|\s+$/g, "");
            name = name.split(/\s+/g);
            items = {
              first: name[0],
              last: name[1]
            };
            if (name.length == 3) {
              items.middle = name[1];
              items.last = name[2];
            }
            break;
          case "control_checkbox":
          case "control_dropdown":
            items = value.split(/\r\n|\r|\n|\,|\<br\>/g);
            break;
          case "control_phone":
            var number = value.split(/\s+/g);
            items = {
              area: number[0],
              phone: number[1],
              full: value
            };
            break;
          case "control_time":
            if (/^([0]?\d|[1][0-2]):([0-5]\d)\s?(?:AM|PM)$/.test(value) || /^(2[0-3]|[01]?[0-9]):([0-5]?[0-9])$/.test(value)) {
              var timeParts = value.split(" ");
              if (timeParts.length > 0) {
                var time = timeParts[0].split(":");
                items = {
                  ampm: timeParts[1],
                  hourSelect: time[0],
                  minuteSelect: time[1]
                };
              }
            }
            break;
        }
        return items;
      }
      return {
        parse,
        clear,
        generateCtrlItems
      };
    }
    ;
    ;
    var _submitLast = {
      t: null,
      submitted: false,
      submit: function(form, delay) {
        if (this.submitted === true) {
          return;
        }
        if (this.t !== null) {
          clearTimeout(this.t);
        }
        this.t = setTimeout(function() {
          this.submitted = true;
          form.submit();
          JotForm.disableButtons();
        }, delay);
      }
    };
    function widgetFrameLoaded(id1) {
      var frameObj = document.getElementById(`customFieldFrame_${id1}`);
      var frameHeight = document.documentElement.clientHeight;
      var frameWidth = document.documentElement.clientWidth;
      var themeVersion1 = window && window.newDefaultTheme || "";
      var enableLog = false;
      var thisForm = JotForm.forms[0] == void 0 || typeof JotForm.forms[0] === "undefined" ? $($$(".jotform-form")[0].id) : JotForm.forms[0];
      if (~[
        "70261670492960",
        "62754049811963",
        "62261204289958",
        "62702584435962",
        "62802961818967",
        "72134468218962"
      ].indexOf(thisForm.id)) {
        enableLog = true;
      }
      if (!frameObj.hasClassName("custom-field-frame-rendered")) {
        enableLog && console.log("Not rendered yet for", id1);
        return;
      }
      if (isOembedWidget(id1)) {
        return;
      }
      JCFServerCommon.frames[id1] = {};
      JCFServerCommon.frames[id1].obj = frameObj;
      var { src } = frameObj;
      JCFServerCommon.frames[id1].src = src;
      JCFServerCommon.submitFrames = [];
      var nextPage = true;
      var section1 = false;
      var referer = src;
      function getIEVersion() {
        var match = navigator.userAgent.match(/(?:MSIE |Trident\/.*; rv:)(\d+)/);
        return match ? parseInt(match[1]) : void 0;
      }
      function isTheFormValidated() {
        return JotForm.validateAll() && $$(".form-line-error").length === 0;
      }
      function IsValidJsonString(str) {
        try {
          JSON.parse(str);
        } catch (e) {
          return false;
        }
        return true;
      }
      function isEmpty(obj) {
        if (obj == null)
          return true;
        if (obj.constructor === Array || obj.constructor === String)
          return obj.length === 0;
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            return false;
          }
        }
        return true;
      }
      function trim(str) {
        if (getIEVersion() === 8) {
          return str.replace(/^\s+|\s+$/g, "");
        }
        return str.trim();
      }
      function isOembedWidget(id) {
        var isOembed = false;
        var iframeElement = document.getElementById(`customFieldFrame_${id}`);
        if (iframeElement.hasAttribute("data-type")) {
          var type = iframeElement.readAttribute("data-type");
          if (type === "oembed") {
            isOembed = true;
          }
        }
        return isOembed;
      }
      function sendMessage(msg, id, to) {
        var ref = referer;
        if (to !== void 0) {
          ref = to;
        }
        var iframeElement = document.getElementById(`customFieldFrame_${id}`);
        if (iframeElement === null) {
          return;
        }
        if (navigator.userAgent.indexOf("Firefox") != -1) {
          XD.postMessage(msg, ref, getIframeWindow(iframeElement));
        } else if (getIEVersion() !== void 0) {
          XD.postMessage(msg, ref, iframeElement);
        } else {
          XD.postMessage(msg, ref, getIframeWindow(iframeElement));
        }
      }
      window.sendMessage2Widget = sendMessage;
      function resize() {
        var frameSizes = {
          width: document.documentElement.clientWidth,
          height: document.documentElement.clientHeight
        };
        sendMessage(JSON.stringify({
          type: "frame:resize",
          frameSizes
        }), id1);
      }
      window.onresize = resize;
      function getWidgetSettings() {
        var el = document.getElementById(`widget_settings_${id1}`);
        return el ? el.value : null;
      }
      function debounce(fn, delay) {
        var timer = null;
        return function() {
          var context = this;
          var args = arguments;
          clearTimeout(timer);
          timer = setTimeout(() => {
            fn.apply(context, args);
          }, delay);
        };
      }
      function isWidgetStatic(id) {
        var el = document.getElementById(`input_${id}`);
        return el && el.hasClassName("widget-static") ? true : false;
      }
      function isWidgetRequired(id) {
        var classNames = document.getElementById(`id_${id}`).className;
        return classNames.indexOf("jf-required") > -1;
      }
      function isWidgetLabelEnabled(id) {
        var labelElement = document.getElementById(`label_${id}`);
        if (labelElement) {
          return labelElement.className.indexOf("form-label") > -1;
        }
        return false;
      }
      function isWidgetFrameReady(id) {
        var targetWidgetFrame = document.getElementById(`customFieldFrame_${id}`);
        return !targetWidgetFrame.hasClassName("frame-ready") && !targetWidgetFrame.retrieve("frame-ready") ? false : true;
      }
      function isEditMode1() {
        return JotForm.isEditMode() || !!~window.location.href.indexOf("/edit/") || !!~window.location.href.indexOf("inlineEdit");
      }
      function sendReadyMessage(id2) {
        var formAll = document.querySelector(".form-all");
        var background = window.getComputedStyle ? window.getComputedStyle(formAll, null).getPropertyValue("background-color") : getStyle(formAll, "background");
        var fontFamily = window.getComputedStyle ? window.getComputedStyle(formAll, null).getPropertyValue("font-family") : getStyle(formAll, "font-family");
        var isCardForm = window.FORM_MODE == "cardform" || window.buildermode === "card";
        var themeVersion = window && window.newDefaultTheme || "";
        var isExtendedTheme = window && window.JotForm.extendsNewTheme || "";
        var msg1 = {
          type: "ready",
          qid: `${id2}`,
          formID: document.getElementsByName("formID")[0].value,
          required: isWidgetRequired(id2),
          static: isWidgetStatic(id2),
          isWidgetLabelEnabled: isWidgetLabelEnabled(id2),
          jotformNext: window.location.href.indexOf("jotformNext=1") > -1 || window.isComingFromJotFormNext == 1,
          cardform: isCardForm,
          background,
          fontFamily,
          origin: window.location.origin || `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ""}`,
          enterprise: JotForm.enterprise,
          themeVersion,
          isExtendedTheme
        };
        var _settings = getWidgetSettings();
        if (_settings && decodeURIComponent(_settings) !== "[]") {
          msg1.settings = _settings;
        }
        var wframe = document.getElementById(`customFieldFrame_${id2}`);
        if (isCardForm && wframe && typeof wframe.up === "function") {
          var jfFieldDiv = wframe.up(".jfField") || false;
          var widgetID = jfFieldDiv && typeof jfFieldDiv.getAttribute === "function" ? jfFieldDiv.getAttribute("data-widget-id") : false;
          if (widgetID) {
            msg1.widgetID = widgetID;
          }
        }
        var fwidth = wframe.readAttribute("data-width") || wframe.parentNode.clientWidth;
        var fheight = wframe.readAttribute("data-height") || wframe.parentNode.clientHeight;
        msg1.width = parseInt(fwidth);
        msg1.height = parseInt(fheight);
        msg1.viewWidth = wframe.parentNode.clientWidth;
        msg1.viewHeight = wframe.parentNode.clientHeight;
        function _sendReadyMessage(id, msg) {
          $(document.getElementById(`customFieldFrame_${id}`)).addClassName("frame-ready").store("frame-ready", true);
          sendMessage(JSON.stringify(msg), id);
        }
        var isEditMode = JotForm.isEditMode() || !!~window.location.href.indexOf("/edit/") || !!~window.location.href.indexOf("inlineEdit");
        enableLog && console.log("ready message inline", msg1);
        if (isEditMode) {
          var interval = 50;
          var timeout = 5e3;
          var currentTime = 0;
          var editCheckInterval = setInterval(() => {
            if (wframe.hasAttribute("data-value") || currentTime >= timeout) {
              clearInterval(editCheckInterval);
              msg1.value = wframe.getAttribute("data-value");
              enableLog && console.log("Ready message sent in", currentTime, msg1);
              _sendReadyMessage(id2, msg1);
            }
            currentTime += interval;
          }, interval);
        } else {
          if (wframe.hasAttribute("data-value")) {
            msg1.value = wframe.getAttribute("data-value");
          } else {
            var input = wframe.parentNode.select(`#input_${id2}`);
            if (input.first().getValue()) {
              msg1.state = "oldvalue";
              msg1.value = input.first().getValue();
            }
          }
          enableLog && console.log("Sending normal ready message", msg1);
          _sendReadyMessage(id2, msg1);
        }
      }
      function unescapeEntities(str) {
        var txt = document.createElement("textarea");
        txt.innerHTML = str;
        return txt.value;
      }
      function escapeEntities(str) {
        var txt = document.createElement("textarea");
        txt.textContent = str;
        return txt.innerHTML;
      }
      window.JCFServerCommon.frames[id1].sendReadyMessage = sendReadyMessage;
      XD.receiveMessage((message) => {
        if (!IsValidJsonString(message.data)) {
          return;
        }
        var data = JSON.parse(message.data);
        enableLog && console.log("Data from widget", data.qid, data);
        if (parseInt(id1) !== parseInt(data.qid)) {
          return;
        }
        if (data.type === "submit") {
          enableLog && console.log("widget submit", document.getElementById(`input_${data.qid}`));
          if (document.getElementById(`input_${data.qid}`)) {
            if (typeof data.value === "number") {
              data.value = `${data.value}`;
            }
            var required = $(document.getElementById(`input_${data.qid}`)).hasClassName("widget-required") || $(document.getElementById(`input_${data.qid}`)).hasClassName("validate[required]");
            var input_id_elem = document.getElementById(`input_${data.qid}`);
            var inputLineParent = input_id_elem.up(".form-line");
            var hasExludedEncryptWidgets = function(formData) {
              return formData.match(/^data:image\/png;base64/ig) || !!~formData.indexOf("widget_metadata") || IsValidJsonString(formData);
            };
            var isParentVisible = JotForm.isVisible(inputLineParent);
            var isElemVisible = inputLineParent.hasClassName("form-field-hidden") || input_id_elem.hasClassName("always-hidden") || !isParentVisible ? false : true;
            if (required) {
              enableLog && console.log(data.qid, "isVisible", isElemVisible);
              if (isElemVisible && "valid" in data && (data.valid === false || data.valid === true && !data.value)) {
                if (isWidgetFrameReady(data.qid)) {
                  input_id_elem.setValue("");
                  enableLog && console.log("LogA: Setting empty input value for", data.qid, data);
                } else {
                  enableLog && console.log("LogA: Setting nothing because isn't ready", data.qid, data);
                }
                if (!input_id_elem.getValue()) {
                  var req_errormsg = JotForm.texts.required || "This field is required";
                  if (typeof data.error !== "undefined" && data.error !== false) {
                    req_errormsg = data.error.hasOwnProperty("msg") ? data.error.msg : req_errormsg;
                  }
                  enableLog && console.log("Errored required element", input_id_elem, data);
                  JotForm.errored(input_id_elem, req_errormsg);
                }
              } else {
                if (isElemVisible && !JotForm.isCollapsed(input_id_elem)) {
                  enableLog && console.log("Correcting required element", input_id_elem, data);
                  JotForm.corrected(input_id_elem);
                }
                if (!isElemVisible && data.valid === true) {
                  enableLog && console.log("Correcting not visible element but valid", input_id_elem, data);
                  JotForm.corrected(input_id_elem);
                }
                if (isWidgetFrameReady(data.qid)) {
                  if (data.value !== void 0) {
                    var finalvalue = data.value;
                    if (JotForm.isEncrypted && data.value && !hasExludedEncryptWidgets(data.value)) {
                      finalvalue = JotEncrypted.encrypt(data.value);
                    }
                    input_id_elem.setValue(escapeEntities(finalvalue));
                    enableLog && console.log("LogB: Setting input value for", data.qid, data);
                  } else {
                    input_id_elem.setValue("");
                    enableLog && console.log("LogC: Setting input value for", data.qid, data);
                  }
                } else {
                  enableLog && console.log("LogA: Widget frame not ready, no value set", data.qid, data);
                }
              }
            } else {
              if (typeof data !== "undefined") {
                if ("value" in data) {
                  if (isWidgetFrameReady(data.qid)) {
                    var finalvalue = data.value;
                    if (JotForm.isEncrypted && data.value && !hasExludedEncryptWidgets(data.value)) {
                      finalvalue = JotEncrypted.encrypt(data.value);
                    }
                    input_id_elem.setValue(escapeEntities(finalvalue));
                  } else {
                    enableLog && console.log("LogB: Widget frame not ready, no value set", data.qid, data);
                  }
                } else if (input_id_elem.hasClassName("widget-static")) {
                  input_id_elem.setValue("");
                  input_id_elem.removeAttribute("name");
                }
              }
            }
            if (input_id_elem && inputLineParent && inputLineParent.hasClassName("form-field-hidden") && JotForm.clearFieldOnHide === "disable") {
              input_id_elem.setValue("");
            }
            if (JCFServerCommon.submitFrames.indexOf(parseInt(data.qid)) < 0) {
              if (isElemVisible && required && !data.valid) {
                enableLog && console.log("Waiting for frame submission, required but not valid", data.qid);
              } else {
                JCFServerCommon.submitFrames.push(parseInt(data.qid));
              }
            }
          }
          var allInputs = $$(".widget-required, .widget-errored");
          var sendSubmit = true;
          for (var i = 0; i < allInputs.length; i++) {
            if (allInputs[i].value.length === 0 && JotForm.isVisible(allInputs[i])) {
              sendSubmit = false;
            }
          }
          if (!nextPage) {
            enableLog && console.log("next page", nextPage, isTheFormValidated(), sendSubmit);
            if (isTheFormValidated() && sendSubmit) {
              enableLog && console.log("sendSubmit", nextPage, sendSubmit);
              var tf = JotForm.forms[0] == void 0 || typeof JotForm.forms[0] === "undefined" ? $($$(".jotform-form")[0].id) : JotForm.forms[0];
              var isEditMode = !!~window.location.href.indexOf("/edit/") || window.location.search.match("inlineEdit|edit");
              var autoSubmit = [
                "stripe",
                "braintree",
                "square",
                "wepay",
                "eway",
                "bluepay",
                "moneris",
                "paypalcomplete",
                "mollie",
                "stripeACHManual",
                "pagseguro"
              ];
              if (!(JotForm.payment && autoSubmit.indexOf(JotForm.payment) > -1 && JotForm.isPaymentSelected() && (JotForm.paymentTotal > 0 || JotForm.payment == "stripe" && window.paymentType == "subscription") && !isEditMode || JotForm.isEncrypted || JotForm.disableSubmitButton)) {
                if ($$('.custom-field-frame[data-type="iframe"]').length === JCFServerCommon.submitFrames.length) {
                  enableLog && console.log("All frames submitted", JCFServerCommon.submitFrames);
                  _submitLast.submit(tf, 50);
                } else {
                  enableLog && console.log("Not all frames submitted", JCFServerCommon.submitFrames);
                }
              }
            } else {
              JotForm.enableButtons();
              JotForm.showButtonMessage();
              JCFServerCommon.submitFrames = [];
            }
          } else {
          }
        } else if (data.type === "data") {
          try {
            var el = document.getElementById(`input_${data.qid}`);
            if (el) {
              el.value = data.value;
              el.triggerEvent("change");
              if (data.value && themeVersion1 && themeVersion1 === "v2") {
                JotForm.corrected(el);
              }
            }
          } catch (e) {
            console.log(e);
          }
          JotForm.triggerWidgetCondition(data.qid);
          JotForm.triggerWidgetCalculation(data.qid);
        } else if (data.type === "errors") {
          var inputElem = document.getElementById(`input_${data.qid}`);
          if (data.action === "show") {
            if (JotForm.isVisible(inputElem)) {
              JotForm.corrected(inputElem);
              inputElem.value = "";
              inputElem.addClassName("widget-errored");
              JotForm.errored(inputElem, data.msg);
              if ("resetForm" in data && data.resetForm === true) {
                JotForm.enableButtons();
              }
            }
          } else if (data.action === "hide") {
            inputElem.removeClassName("widget-errored");
            JotForm.corrected(inputElem);
          }
        } else if (data.type === "required") {
          var inputElem = document.getElementById(`input_${data.qid}`);
          if (data.action === "set" && !inputElem.hasClassName("widget-required")) {
            inputElem.addClassName("widget-required");
          } else if (data.action === "unset") {
            inputElem.removeClassName("widget-required");
            JotForm.corrected(inputElem);
          }
        } else if (data.type === "form:trackerID") {
          sendMessage(JSON.stringify({
            eventID: data.eventID,
            type: "event:receiver",
            data: $$('[name="event_id"]')[0] ? $$('[name="event_id"]')[0].value : ""
          }), data.qid);
        } else if (data.type === "size") {
          var { width } = data;
          var { height } = data;
          if (width !== void 0 && width !== null) {
            if (Number(width) === 0) {
              width = "auto";
            }
            if (typeof width === "number") {
              width = `${width}px`;
            }
            document.getElementById(`customFieldFrame_${data.qid}`).style.width = width;
          }
          if (height !== void 0 && height !== null) {
            if (Number(height === 0)) {
              height = "auto";
            }
            if (typeof height === "number") {
              height = `${height}px`;
            }
            document.getElementById(`customFieldFrame_${data.qid}`).style.height = height;
            if (getIEVersion() !== void 0) {
              document.getElementById(`cid_${data.qid}`).style.height = height;
            }
          }
          JotForm.iframeHeightCaller();
        } else if (data.type === "styles") {
          if ("styles" in data && !isEmpty(data.styles)) {
            $(`customFieldFrame_${data.qid}`).setStyle(data.styles);
          }
        } else if (data.type === "replace") {
          try {
            var { inputType } = data;
            var { isMobile } = data;
            var isRequired = data.required;
            var parentDiv = $(`customFieldFrame_${data.qid}`).up();
            var inputName = $(`input_${data.qid}`).readAttribute("name");
            $(`customFieldFrame_${data.qid}`).remove();
            $(`input_${data.qid}`).up().remove();
            var newInput = "";
            var validationClass = isRequired ? "validate[required] widget-required widget-replaced" : "";
            switch (inputType) {
              case "control_fileupload":
                var tf = JotForm.forms[0] == void 0 || typeof JotForm.forms[0] === "undefined" ? $($$(".jotform-form")[0].id) : JotForm.forms[0];
                tf.setAttribute("enctype", "multipart/form-data");
                if (!isMobile) {
                  validationClass = validationClass === "" ? "validate[upload]" : validationClass;
                  newInput = `<input class="form-upload ${validationClass}" type="file" id="input_${data.qid}" name="${inputName}" file-accept="pdf, doc, docx, xls, xlsx, csv, txt, rtf, html, zip, mp3, wma, mpg, flv, avi, jpg, jpeg, png, gif"file-maxsize="10240">`;
                }
                parentDiv.insert(newInput);
                break;
              case "control_textbox":
                newInput = `<input class="form-textbox ${validationClass}" type="text" data-type-"input-textbox" id="input_${data.qid}" name="${inputName}">`;
                parentDiv.insert(newInput);
                break;
              case "control_textarea":
                newInput = `<textarea class="form-textarea ${validationClass}" type="text" id="input_${data.qid}" name="${inputName}" cols="40" rows="6"></textarea>`;
                parentDiv.insert(newInput);
                break;
              default:
                break;
            }
          } catch (e) {
            console.log(e);
          }
        } else if (data.type === "event:listener") {
          var field = document.getElementById(data.field);
          if (field) {
            if ([
              "keyup",
              "change"
            ].indexOf(data.event) > -1) {
              enableLog && console.log("Event registered from ", data.qid);
              var handler = function(el2) {
                var fieldValue = el2.target.value;
                fieldValue = typeof fieldValue !== "undefined" ? fieldValue : "";
                enableLog && console.log("Handler for ", data.qid, "triggered", fieldValue, el2.target.id);
                if (el2.target.id === data.field) {
                  enableLog && console.log("event:receiver: Sending message to ", data.qid, "with value", fieldValue);
                  sendMessage(JSON.stringify({
                    eventID: data.eventID,
                    type: "event:receiver",
                    value: fieldValue
                  }), data.qid);
                }
              };
              Event.observe(field, data.event, data.event === "keyup" ? debounce(handler, 100) : handler);
            }
          }
        } else if (data.type === "event:store") {
          var field = document.getElementById(data.field);
          if (field) {
            var targetQID = $(data.field).up(".form-line").id.split("_")[1];
            var messageData = {
              eventID: data.eventID,
              type: "event:receiver",
              value: data.value
            };
            if (JotForm.getInputType(targetQID) === "widget" || "isWidget" in data && data.isWidget) {
              if (window.console && "warn" in console) {
                console.warn("Sending value to destination(widget) from a source(widget) is not recommended.");
              }
              delete messageData.eventID;
              messageData.field = data.field;
              messageData.isWidget = true;
              messageData.targetQID = targetQID;
              enableLog && console.log("Sending data to widget field", targetQID, messageData);
              sendMessage(JSON.stringify(messageData), targetQID);
            } else {
              field.setValue(data.value);
              if ("hasCallback" in data && data.hasCallback) {
                enableLog && console.log("Sending data to native field", data);
                sendMessage(JSON.stringify(messageData), data.qid);
              }
            }
          }
        } else if (data.type === "field:hide") {
          $(`input_${data.qid}`).up(".form-line").hide();
          if (window.FORM_MODE && window.FORM_MODE == "cardform") {
            window.CardForm.setCardVisibility(window.CardForm.cards.filter((card) => {
              return card.question.id == data.qid;
            })[0], false);
          }
        } else if (data.type === "field:show") {
          $(`input_${data.qid}`).up(".form-line").show();
        } else if (data.type === "fields:capture") {
          var allowedFieldTypes = [
            "control_textbox",
            "control_textarea",
            "control_dropdown",
            "control_datetime",
            "control_phone",
            "control_fullname",
            "control_hidden",
            "control_email"
          ];
          var fieldValues = [];
          var question1;
          data.fields.forEach((fieldSelector) => {
            var value1 = "";
            var parent;
            var questionType;
            if (!fieldSelector.match(/\[\w+\]/)) {
              if (data.identifier === "name") {
                $$(".form-textbox, .form-dropdown, .form-textarea, .form-hidden").some((field2) => {
                  if (field2.name.match(new RegExp(`(${fieldSelector}$)|(${fieldSelector}\\[)`))) {
                    return parent = field2.up("li");
                  }
                });
              } else {
                parent = $(`id_${fieldSelector}`);
              }
              questionType = parent ? parent.getAttribute("data-type") : "";
              if (!parent || allowedFieldTypes.indexOf(questionType) === -1) {
                fieldValues.push({
                  selector: fieldSelector,
                  value: ""
                });
                return;
              }
              value1 = $$(`#${parent.id} input, #${parent.id} select`).map((field2) => {
                if (field2.id == `lite_mode_${parent.id}`) {
                  return "";
                }
                return field2.tagName === "SELECT" ? field2.getSelected().value : field2.value;
              }).filter((value) => {
                return !!value;
              });
              if (questionType === "control_datetime" && parent.down("[id*=lite_mode_]")) {
                value1 = parent.down("[id*=lite_mode_]").value;
              }
              value1 = value1.length <= 1 ? value1[0] || "" : value1;
            } else {
              var question = $$(`[name$="_${fieldSelector}"]`)[0] || false;
              if (question) {
                value1 = question.tagName === "SELECT" ? question.getSelected().value : question.value;
                parent = question.up("li.form-line");
                questionType = question.up("li.form-line").getAttribute("data-type");
              }
            }
            if (typeof value1 === "object") {
              var separator = " ";
              switch (questionType) {
                case "control_datetime":
                  separator = parent.down(".date-separate") ? parent.down(".date-separate").innerHTML.replace(/\s|\&nbsp;/g, "") : "/";
                  break;
                case "control_phone":
                  separator = "-";
                default:
              }
              value1 = value1.join(separator);
            }
            fieldValues.push({
              selector: fieldSelector,
              value: value1,
              type: questionType || ""
            });
          });
          sendMessage(JSON.stringify({
            eventID: data.eventID,
            type: "event:receiver",
            data: fieldValues
          }), data.qid);
        } else if (data.type === "fields:fill") {
          var dataprops = {};
          $$(".form-line").filter((node) => {
            return [
              "control_textbox",
              "control_scale",
              "control_radio",
              "control_checkbox",
              "control_dropdown",
              "control_rating",
              "control_datetime",
              "control_fullname",
              "control_phone",
              "control_birthdate",
              "control_address",
              "control_time",
              "control_email",
              "control_textarea",
              "control_emojislider",
              "control_yesno",
              "control_number"
            ].include(node.readAttribute("data-type"));
          }).each((node, index2) => {
            var qid = node.id.split("_")[1];
            var qtype = node.readAttribute("data-type");
            var labelEl;
            if (window.FORM_MODE && window.FORM_MODE == "cardform") {
              labelEl = node.select(".jfQuestion-label").first();
            } else {
              labelEl = node.select(".form-label").first();
            }
            var cloneLabelEl = labelEl.clone(true);
            var labelRequiredEl = cloneLabelEl.select(".form-required").first() || cloneLabelEl.select(".jfRequiredStar").first();
            if (labelRequiredEl) {
              labelRequiredEl.remove();
            }
            var labelText = cloneLabelEl ? cloneLabelEl.innerText || cloneLabelEl.textContent || "" : "";
            var props = {
              name: "",
              value: "",
              items: "",
              text: trim(labelText.toLowerCase()),
              type: qtype
            };
            for (var x = 0; x < data.fields.length; x++) {
              var found = false;
              if (data.identifier === "label") {
                var dataFieldLabel = (data.fields[x].label || "").toString().toLowerCase();
                found = props.text === dataFieldLabel ? true : false;
              } else if (data.identifier === "id") {
                found = Number(qid) === Number(data.fields[x].id) ? true : false;
              } else {
                console.error("Unknown identifier", data.identifier, "use the question label or qid");
                break;
              }
              if (found && $(`cid_${qid}`)) {
                var el2 = $(`cid_${qid}`).select("input, select, textarea").first();
                if (el2) {
                  props.name = el2.readAttribute("name").replace(`q${qid}_`, "");
                  props.value = data.fields[x].value;
                  var items = data.fields[x].items ? data.fields[x].items : widgetAutoFill().generateCtrlItems(qtype, props.value);
                  if (!isEmpty(items)) {
                    props.items = items;
                  }
                  if (!(qid in dataprops)) {
                    dataprops[qid] = {};
                  }
                  dataprops[qid] = props;
                }
                break;
              }
            }
          });
          if (!isEmpty(dataprops)) {
            enableLog && console.log("data props", dataprops);
            widgetAutoFill().parse(dataprops);
          }
          JotForm.runAllCalculations();
        } else if (data.type === "fields:clear") {
          var fields = [];
          data.fields = data.fields.map((field2) => {
            return field2.toLowerCase();
          });
          $$(".form-label, .jfQuestion-label").each((label) => {
            var tempLabel = label.clone(true);
            var requiredElement = tempLabel.select(".form-required, .jfRequiredStar").first();
            if (requiredElement) {
              requiredElement.remove();
            }
            var text = tempLabel.innerText.trim().toLowerCase();
            if (data.fields.indexOf(text) > -1) {
              var qid = label.id.match(/_(\d+)$/)[1] || "";
              var type = label.up(".form-line").getAttribute("data-type") || "";
              if (qid && type) {
                fields.push({
                  qid,
                  type
                });
              }
            }
          });
          try {
            widgetAutoFill().clear(fields);
          } catch (e) {
            console.error(e);
          }
        } else if (data.type === "submit:frame:remove") {
          if (JCFServerCommon.submitFrames.length > 0) {
            var findex = JCFServerCommon.submitFrames.indexOf(parseInt(data.qid));
            if (findex >= 0) {
              JCFServerCommon.submitFrames.splice(findex, 1);
            }
          }
        } else if (data.type === "frame:move") {
          var documentTop = document.body.getBoundingClientRect().top;
          var frameYPosition = frameObj.getBoundingClientRect().top - documentTop;
          var section = frameObj.up("ul.form-section.page-section");
          if (section) {
            var sectionHeight = section.getHeight();
            var widgetPositionObserver = new MutationObserver((mutations) => {
              if (JotForm.isVisible(frameObj) && section.getHeight() !== sectionHeight) {
                var newPosition = frameObj.getBoundingClientRect().top - documentTop;
                if (Math.abs(frameYPosition - newPosition) > 5) {
                  sectionHeight = section.getHeight();
                  frameYPosition = newPosition;
                  sendMessage(JSON.stringify({
                    eventID: data.eventID,
                    type: "event:receiver",
                    data: {
                      position: frameYPosition
                    }
                  }), data.qid);
                }
              }
            });
            widgetPositionObserver.observe(section, {
              subtree: true,
              attributes: true,
              attributeFilter: [
                "class",
                "style"
              ]
            });
          }
        } else if (data.type === "frame:getdata") {
          var labelHeight = 0;
          var actionHeight = 0;
          var jfProgressHeight = 0;
          if (window.FORM_MODE == "cardform" || window.buildermode === "card") {
            labelHeight = document.getElementById(`label_${id1}`).clientHeight;
            actionHeight = document.getElementsByClassName("jfCard-actions")[0].clientHeight;
            jfProgressHeight = document.querySelectorAll(".jfProgress, .no-animate")[0].clientHeight;
          }
          var frameData = {
            width: frameWidth,
            height: frameHeight,
            labelHeight,
            actionHeight,
            jfProgressHeight
          };
          sendMessage(JSON.stringify({
            type: "event:receiver",
            eventID: data.eventID,
            frameData
          }), data.qid);
        }
      }, frameObj.src.replace(/([^:]+:\/\/[^\/]+).*/, "$1"));
      frameObj.addClassName("frame-xd-ready").store("frame-xd-ready", true);
      enableLog && console.log("sending settings", getWidgetSettings(), new Date().getTime());
      sendMessage(JSON.stringify({
        type: "settings",
        settings: getWidgetSettings()
      }), id1);
      enableLog && console.log("sending form strings", JotForm.texts, new Date().getTime());
      sendMessage(JSON.stringify({
        type: "formstrings",
        formTexts: JotForm.texts
      }), id1);
      var widgetSection = JotForm.getSection(frameObj);
      if (frameObj && JotForm.isVisible(widgetSection) && JotForm.isVisible(frameObj) && typeof frameObj.up(".form-section-closed") === "undefined") {
        enableLog && console.log("Frame widget object is visible", JotForm.isVisible(widgetSection), JotForm.isVisible(frameObj), typeof frameObj.up(".form-section-closed") === "undefined");
        sendReadyMessage(id1);
      } else if (document.get.jumpToPage) {
        var pageToJump = parseInt(document.get.jumpToPage);
        if (!isNaN(pageToJump) && widgetSection === $$(".form-section:not([id^=section_])")[pageToJump - 1]) {
          var jumpInterval = setInterval(() => {
            if (JotForm.isVisible(frameObj)) {
              enableLog && console.log(`Form jump to widget page (${pageToJump}); sending ready message...`);
              sendReadyMessage(id1);
              clearInterval(jumpInterval);
            }
          }, 200);
        }
      }
      window.onresize = function() {
        var frameSizes = {
          width: document.documentElement.clientWidth,
          height: document.documentElement.clientHeight
        };
        sendMessage(JSON.stringify({
          type: "frameresize",
          frameSizes
        }), id1);
      };
      thisForm.observe("submit", (e) => {
        if (document.getElementById(`customFieldFrame_${id1}`) === null) {
          return;
        }
        if ($$(".form-submit-button") && $$(".form-submit-button").length > 0) {
          var isSubmitBtnVisible = false;
          $$(".form-submit-button").each((el) => {
            if (JotForm.isVisible(el.parentNode)) {
              isSubmitBtnVisible = true;
            }
          });
          e.stop();
          if (!isSubmitBtnVisible) {
            JotForm.enableButtons();
          } else {
            nextPage = false;
            enableLog && console.log("Form stopped from widget server event, submitting form from widge submit event");
            sendMessage(JSON.stringify({
              type: "submit",
              qid: `${id1}`
            }), `${id1}`);
          }
        }
      });
      $$(".form-pagebreak-back").each((b) => {
        $(b).observe("click", () => {
          if (JotForm.currentSection.down(`#customFieldFrame_${id1}`) && !isWidgetFrameReady(id1)) {
            enableLog && console.log("Sending ready message to unready widget");
            sendReadyMessage(id1);
          }
        });
      });
      $$(".form-pagebreak-next").each((b, i) => {
        enableLog && console.log("Going to next page");
        $(b).observe("click", function(e) {
          section1 = this.up(".form-section");
          nextPage = true;
          if (section1.select(`#customFieldFrame_${id1}`).length > 0) {
            enableLog && console.log("Sending submit message for iframe id", id1, "from section", this.up(".form-section"), "and iframe", frameObj);
            sendMessage(JSON.stringify({
              type: "submit",
              method: "next",
              qid: `${id1}`
            }), `${id1}`);
            Event.stop(e);
          }
          var checkIntevarl = setInterval(() => {
            frameObj = document.getElementById(`customFieldFrame_${id1}`);
            if (frameObj) {
              section1 = $(frameObj).up(".form-section");
              if (JotForm.isVisible(section1) && JotForm.isVisible(frameObj)) {
                clearInterval(checkIntevarl);
                enableLog && console.log("Sending ready message for iframe id", id1, "from section", section1);
                sendReadyMessage(id1);
              } else {
                enableLog && console.log("Section and frameObj not visible", section1, frameObj);
                clearInterval(checkIntevarl);
              }
            } else {
              clearInterval(checkIntevarl);
            }
          }, 100);
        });
      });
      if ($(`input_${id1}`)) {
        [
          "widget:clear",
          "widget:populate",
          "widget:shift"
        ].forEach((widgetEvent) => {
          $(`input_${id1}`).observe(widgetEvent, (e) => {
            var { qid } = e.memo;
            var message = {
              type: widgetEvent.replace(":", ""),
              qid
            };
            if (widgetEvent == "widget:populate") {
              message.value = e.memo.value || "";
            }
            sendMessage(JSON.stringify(message), qid);
          });
        });
      }
    }
    ;
    injectPostMessage();
    injectGetStyle();
    makeJCFServerCommonChecks();
    window.widgetFrameLoaded = widgetFrameLoaded;
    var index = {
      widgetFrameLoaded
    };
    __webpack_exports__ = __webpack_exports__["default"];
    return __webpack_exports__;
  }();
});
