(function() {

  function ProgressBar() {

    // exposed functions
    this.init = init;
    this.getHiddenList = getHiddenList;
    this.getFieldList = getFieldList;
    var countFields = [
      'select', 'radio', 'checkbox', 'file',
      'combined', 'email', 'address', 'datetime', 'appointment',
      'time', 'birthdate', 'number', 'autocomplete',
      'text', 'textarea', 'signature', 'div',
      'slider', 'widget', 'rating'
    ];

    var totalFields = 0;
    var completedFields = 0;
    var progressBar = false;
    var onlyCountVisible = 'Yes';
    var onlyCountRequired = onlyCountReq && onlyCountReq === 'Yes';
    var fixedLayout = fixedProgressBar && fixedProgressBar === 'Yes';
    var deleteLabelProgressBars = [];
    var defaultIgnored = ['facebookLikeBox', 'timeTracker'];
    var fieldList = {};
    var progressBarColor = barColor;
    var isNewDefaultTheme = window.newDefaultTheme && window.newDefaultTheme === 'v2';
    var isExtendedTheme = window && window.JotForm && window.JotForm.extendsNewTheme;
    //save id's
    var hiddenList = [];
    var fieldEvents = {
      radio: ['click', 'change'],
      checkbox: ['click', 'change'],
      signature: ['click', 'change'],
      select: ['change'],
      file: ['change', 'click'],
      datetime: ['date:changed', 'change'],
      appointment: 'input',
      time: 'change',
      birthdate: 'change',
      number: ['keyup', 'click', 'change'],
      widget: ['change'],
      default: ['keyup', 'change']
    };

    // create delete labels
    if (typeof deleteLabelProgressBar !== 'undefined') {
      if (deleteLabelProgressBar.indexOf('\n') > -1) {
        deleteLabelProgressBars = deleteLabelProgressBar.split('\n');
      } else {
        deleteLabelProgressBars = deleteLabelProgressBar;
      }

      for (var n = 0; deleteLabelProgressBars.length > n; n++) {
        deleteLabelProgressBars[n] = trim(deleteLabelProgressBars[n]);
      }
    }

    // assign text helpers
    var text_required_progress = (isNewDefaultTheme || isExtendedTheme) ? 'Required fields' : 'required fields completed';
    if (typeof requiredProgressBar != 'undefined' && requiredProgressBar != '<empty>' && requiredProgressBar != '') {
      text_required_progress = requiredProgressBar;
    }
    var text_fields_progress = (isNewDefaultTheme || isExtendedTheme) ? 'Fields' : 'populated fields completed';
    if (typeof fieldsProgressBar != 'undefined' && fieldsProgressBar != '<empty>' && fieldsProgressBar != '') {
      text_fields_progress = fieldsProgressBar;
    }
    var text_submit_progress = 'Please submit your completed form';
    if (typeof submitProgressBar != 'undefined' && submitProgressBar != '<empty>' && submitProgressBar != '') {
      text_submit_progress = submitProgressBar;
    }

    /**
     * initialize widget
     */
    function init() {
      // add progress bar to page
      addBarToScreen();

      // setup field listeners to update progress bar
      setupFieldListeners();

      // setup condition listeners to update progressbar
      // if a translation is enabled
      // wait for it to finish before setting up the listeners for conditions
      var languageDropdown = $$('.language-dd').first();
      if (languageDropdown) {
        var languageInterval = setInterval(function() {
          if (languageDropdown.style.display !== 'none') {
            clearInterval(languageInterval);
            setupConditionListeners();
          }
        }, 100);
      } else {
        setupConditionListeners();
      }

      // if only counting visible fields
      // if (onlyCountVisible) {
      //   listenForPageChange();
      // }

      // hide widget container
      if (typeof progressBarqid !== 'undefined') {
        $$(".direct-embed-" + progressBarqid).first().up('.form-line').hide();
      }
    }

    /**
     * Make action to a single field list
     */
    function handleFieldList(el) {
      var id = el.id.split('_')[1];
      var type = JotForm.getInputType(id);
      var fieldHasContent;

      // for file types we have to handle it properly
      if (type === 'file') {
        if (el.select('.qq-upload-list').first()) {
          // TODO improve multiple - this isn't fully working yet
          fieldHasContent = (el.select('.qq-upload-list').first().innerHTML.length > 0);
        } else {
          // var oldElFile = el.select('#old_' + id + '[name=input_' + id + '_old]').first();
          // fieldHasContent = (oldElFile && oldElFile.getValue().length > 0) ? true : fieldHasContent;
          fieldHasContent = JotForm.fieldHasContent(id)
        }
      } else {
        fieldHasContent = JotForm.fieldHasContent(id)
      }

      if (el.getAttribute('data-type') === 'control_matrix' && !el.hasClassName('form-field-hidden') && el.hasClassName('jf-required')) {
        // handle basic table's fields if the table is required in the form
        // fill out all required rows then add the count
        var table = $('cid_' + id).select('table').first();
        var validRows = [];
        // handle verification options
        var requireOneAnswer = false;
        var requireEveryCell = false;
        var firstInput = table.select('.form-matrix-values input, select')[0];
        if (firstInput.className.indexOf('requireOneAnswer') + 1) {
          requireOneAnswer = true;
        } else if (firstInput.className.indexOf('requireEveryCell') + 1) {
          requireEveryCell = true;
        }

        table.select('.form-matrix-value-tr').each(function(row, index) {
          if (type === 'combined' || type === 'radio' || type === 'checkbox') {
            row.select('input').each(function(input) {
              if (type === 'combined' && input['type'] !== 'checkbox' && input['type'] !== 'radio' && input.value && validRows.indexOf(index) == -1) {
                validRows.push(index);
              } else if (input.checked && input['type'] !== 'text' && validRows.indexOf(index) == -1) {
                validRows.push(index);
              } else if ((type === 'radio' || type === 'checkbox') && input['type'] == 'text' && input.value && validRows.indexOf(index) == -1) {
                validRows.push(index);
              }
            });
            if (row.select('select').length > 0) {
              var selects = row.select('select');
              for (var i = 0; i < selects.length; i++) {
                if (selects[i].options.selectedIndex > 0 && validRows.indexOf(index) == -1) {
                  validRows.push(index);
                  break;
                }
              }
            }
          } else if (type === 'select') {
            var selects = row.select('select');
            for (var i = 0; i < selects.length; i++) {
              if (selects[i].options.selectedIndex > 0) {
                validRows.push(i);
                break;
              }
            }
          }
        });

        function isInputTypeRadioOrCheckbox(input) {
          return ['radio', 'checkbox'].indexOf(input.type) !== -1;
        }

        function isFilled(el) {
          return isInputTypeRadioOrCheckbox(el) ? el.checked : (!!el.value && !el.value.strip(" ").empty());
        }

        function getElementsInRow(row) {
          return Array.from(row.querySelectorAll('input,select'));
        }

        function allRowElementsFilled(rowElements) {
          var singleChoiceFilled = rowElements.every(function(e) { return e.type !== 'radio' }) || rowElements
            .filter(function isRadio(e) { return e.type === 'radio'; })
            .map(isFilled)
            .any(function(e) { return e; });

          var othersFilled = rowElements
            .filter(function notRadio(e) { return e.type !== 'radio'; })
            .map(isFilled)
            .every(function(e) { return e; });

          return singleChoiceFilled && othersFilled;
        }
        // check if all cells are filled
        if (requireEveryCell) {
          var hasAnswerEveryCell = Array.from(table.rows)
            .map(getElementsInRow)
            .filter(function notEmpty(el) { return el.length; })
            .map(allRowElementsFilled)
            .every(function (el) { return el; });
        }

        if ((requireEveryCell && hasAnswerEveryCell) || 
          !requireEveryCell && (validRows.length == table.select('.form-matrix-value-tr').length || 
          requireOneAnswer && validRows.length)) {
            fieldList[el.id] = true;
            el.writeAttribute('data-progress', 'true');
        } else {
          fieldList[el.id] = false;
          el.writeAttribute('data-progress', 'false');
        }
      } else if (fieldHasContent && !el.hasClassName('form-field-hidden')) { // this field has content
        if (onlyCountRequired) {
          // check field labels for form-required class
          // handle data progress if a required condition used
          if(el.select('.form-label').length == 0){
            fieldList[el.id] = true;
            el.writeAttribute('data-progress', 'true');
          }
          el.select('.form-label').each(function(formlabel) {
            if (!formlabel.select('.form-required').length) {
              fieldList[el.id] = false;
              el.writeAttribute('data-progress', 'false');
            } else if (el.hasClassName('jf-required')) {
              fieldList[el.id] = true;
              el.writeAttribute('data-progress', 'true');
            }
          });
        } else {
          fieldList[el.id] = true;
          el.writeAttribute('data-progress', 'true');
        }
      } else {
        fieldList[el.id] = false;
        el.writeAttribute('data-progress', 'false');
      }

      return fieldList[el.id];
    }

    /**
     * Update the progress bar from a single event
     */
    var interval = null;

    function updateProgressSingle(el) {
      // get the form line el if the event
      // comes from the descendant
      if (typeof el.up('.form-line') !== 'undefined') {
        el = el.up('.form-line');
      }

      // hacky method to constantly check the value of the element
      // only when the el is required and errored
      // JotForm.fieldHasContent
      if (el.hasClassName('form-line-error') ||
        (el.select('.form-custom-hint') && el.select('.form-custom-hint').length > 0)
      ) {
        // clear any previous interval if any
        if (typeof interval !== 'undefined') {
          clearInterval(interval);
          interval = null;
        }
        // create interval
        interval = setInterval(function() {
          if (handleFieldList(el)) {
            clearInterval(interval);
            interval = null;
            updateProgressBar();
          }
        }, 250);
      } else {
        handleFieldList(el);
        updateProgressBar();
      }
    }

    /**
     * Updates the progress bar
     * and its status messages
     */
    function updateProgressBar() {
      // for required and hidden, minus begin state of hidden field and hidden when something is changed
      var totalFields = Object.keys(fieldList).length - hiddenList.length;
      // we dont need anymore begin state for required and hidden
      // beginStateHiddenFields = 0;

      var completedFields = 0;
      for (var x in fieldList) {
        if (fieldList[x]) {
          completedFields++;
        }
      }

      // for required and hidden
      /*
       if (!completedFields <= 0) {
       completedFields = completedFields - hiddenList.length;
       }
       */
      var percentage = parseInt(100 / totalFields * completedFields);
      if (isNaN(percentage)) {
        percentage = 0;
        completedFields = 0;
      } else if (percentage > 100) {
        percentage = 100;
      }
      progressBar.set(percentage);
      $('progressPercentage').update(percentage + '% ');
      $('progressCompleted').update(completedFields);
      if (percentage === 100) {
        $('progressSubmissionReminder').show();
        $('status_text1').hide();
      } else {
        $('progressSubmissionReminder').hide();
        $('status_text1').show();
      }

      if (isNewDefaultTheme || isExtendedTheme) {
        document.querySelector('.progressjs-inner').style.backgroundColor = progressBarColor;
        if (percentage === 100) {
          $('progressTextCompleted').hide();
          $('status_text1').show();
          document.querySelector('.progressjs-inner').addClassName('progressjs-inner-completed');
          document.querySelector('.progressBarSubtitle').style.color = progressBarColor;
        } else {
          $('progressTextCompleted').show();
        }
      }

      $('progressTotal').update(totalFields);
    }

    // function for checking exist hidden&&required filed in hiddenList, for no dublicates;
    function existHiddenInArr(el, arr) {
      if (arr.length < 1) {
        return false;
      }
      for (var i = 0; i < arr.length; i++) {
        if (el.id === arr[i]) {
          return true;
        }
      }
      return false;
    }

    function pushToHiddenList(id) {
      // if hidden checking dublicatates
      var isInHiddenList = false;
      for (var i = 0; i < hiddenList.length; i++) {
        if (hiddenList[i] === id) {
          isInHiddenList = true;
          break;
        }
      }

      if (!isInHiddenList) {
        // if no dublicatates we have to add el to hiddenList
        // console.log('Pushing', id, 'to hiddenList');
        hiddenList.push(id);
      }
    }

    function removeFromHiddenList(id) {
      for (var i = 0; i < hiddenList.length; i++) {
        if (hiddenList[i] === id) {
          // console.log('Popping', id, 'from hiddenList');
          hiddenList.splice(i, 1);
        }
      }
    }

    function getHiddenList() {
      return hiddenList;
    }

    function getFieldList() {
      return fieldList;
    }

    /**
     * Set listener to single element
     */
    function setListener(el, event, wait) {
      if (wait) {
        el.observe(event, function() {
          var self = this;
          setTimeout(function() {
            updateProgressSingle(self);
          }, 1000);
        });
      } else {
        el.observe(event, function() {
          // console.log('Triggered', event, 'for', this.id);
          // checking hiiden or not filed
          if (this.hasClassName('form-field-hidden')) {
            pushToHiddenList(this.id);
          } else if (onlyCountRequired) {
            var id = this.id.split('_')[1];
            var fieldType = JotForm.getInputType(id);
            if (fieldType === 'widget') {
              removeFromHiddenList(this.id);
            } else {
              this.select('.form-label').each(function(formlabel) {
                if (!formlabel.select('.form-required').length) {
                  pushToHiddenList(el.id);
                }
              });
            }
          } else {
            removeFromHiddenList(this.id);
          }

          updateProgressSingle(this);
        });
      }
    }

    /**
     * Trigger event of element if it has a content
     */
    function triggerEventIfHasContent(el, event, cid) {
      var id = (typeof cid !== 'undefined') ? cid : el.id.split('_')[1];
      var customEvt = (!!~event.indexOf(':')) ? true : false;
      if (JotForm.fieldHasContent(id)) {
        if (customEvt) {
          el.fire(event);
        } else {
          el.triggerEvent(event);
        }
      }
    }

    /**
     * Check if a field will be ignored by its label
     */
    function willIgnoreFromLabel(el) {
      var label;
      el.select('.form-label').each(function(formlabel) {
        var labelClone = formlabel.clone(true);
        if (labelClone.select('.form-required').length) {
          labelClone.select('.form-required').first().remove();
        }
        label = trim(labelClone.textContent || labelClone.innerText);
      });
      return (label && label.length > 0 && deleteLabelProgressBars.indexOf(label) > -1);
    }

    /**
     * Ignore static type of widgets
     */
    function willIgnoreStaticWidgets(el) {
      return (el && typeof el.select('input.widget-static').first() !== 'undefined') ? true : false;
    }
    /**
    *If you want add widget to ignore just add defaultIgnored widget src name
    */
    function willDefaultIgnored(el, type){
      var ignore = false;
      if (type == 'widget'){
        var iframe = el.select("iframe").first()
        if (typeof  iframe!== 'undefined' ){
          var iframeSrc = iframe.src;
          for (var i = 0; i < defaultIgnored.length; i++) {
            if (iframeSrc.indexOf(defaultIgnored[i]) > -1){
              ignore = true;
            }
          }
        }
      }
      return ignore;
    }

    function willIngoreDisabled(el){

      if (!el.select('input').first()){
        return false;
      }else {
        return el.select('input').first().readOnly;
      }
    }


    function setupConditionListeners() {
      if (JotForm.conditions.length > 0) {
        var fieldsToTrigger = {};
        for (var c = 0; c < JotForm.conditions.length; c++) {

          // if there are multiple events for the field
          // register it for the common source field
          var terms = JotForm.conditions[c].terms;
          var actions = JotForm.conditions[c].action;
          for (var t = 0; t < terms.length; t++) {
            var field = Number(terms[t].field);
            if (!(field in fieldsToTrigger)) {
              fieldsToTrigger[field] = [];
            }

            // read the actions
            for (var a = 0; a < actions.length; a++) {
              if ('visibility' in actions[a]) {
                var visibility = actions[a].visibility.toLowerCase();
                if (visibility === 'show' || visibility === 'hide' || visibility === 'disable' ||
                  (onlyCountRequired && (visibility === 'require') || (visibility === 'unrequire'))) {
                  // trigger an event to the field
                  var afield = Number(actions[a].field);
                  //TODO add comment here
                  fieldsToTrigger[field].push(afield);
                } else if (visibility === 'showmultiple' || visibility === 'hidemultiple'
                  || visibility === 'requiremultiple' || visibility === 'unrequiremultiple') {
                  var afields = actions[a].fields;
                  for (var f = 0; f < afields.length; f++) {
                    var afield = Number(afields[f]);
                    fieldsToTrigger[field].push(afield);
                  }
                }
              }
            }
          }
        }
          for (var fid in fieldsToTrigger) {
          var fieldType = JotForm.getInputType(fid);
          var fieldTypeEvent = getFieldEvent(fieldType);
          if ($('id_' + fid) && fieldsToTrigger[fid].length > 0) {
            var events = (isArray(fieldTypeEvent)) ? fieldTypeEvent : [fieldTypeEvent];
            for (var evt = 0; evt < events.length; evt++) {
              if (typeof events[evt] != 'undefined'){
                $('id_' + fid).observe(events[evt], function() {

                  var id = this.id.split('_')[1];
                  for (var x = 0; x < fieldsToTrigger[id].length; x++) {
                    // decide if to push or pop from hidden list
                    var cid = fieldsToTrigger[id][x];
                    var el = $('id_' + cid);
                    if (el) {
                      // - Get input type and check if can be counted
                      // - Get label of the element
                      // - and do not include static widgets they meant to show data only
                      if (willIgnoreField(el)) {
                        // quite do nothing
                      } else {
                        // checking hiden or not filed
                        if (el.hasClassName('form-field-hidden') || el.hasClassName('always-hidden')
                        || (el.select('input, select').length && el.select('input, select').first().disabled)) {
                          pushToHiddenList(el.id);
                        } else {
                          removeFromHiddenList(el.id);
                        }

                        if (onlyCountRequired){
                          if (el.select('.form-required').length
                            && !(el.hasClassName('form-field-hidden') || el.hasClassName('always-hidden'))
                            // these 2 hidden classes also cover disabled elements - commented by Hayk
                            // && (el.select('input, select').length && !el.select('input, select').first().disabled)
                          ) {
                            removeFromHiddenList(el.id);
                          } else {
                            pushToHiddenList(el.id);
                          }
                        }
                        //check if filed required removed

                        updateProgressSingle(el);
                      }
                    }
                  }
                });
              }
            }
          }
        }
      }
    }

    /**
     * All other checks will be seen here
     */
    function willIgnoreField(el) {
      var id = el.id.split('_')[1];
      var type = JotForm.getInputType(id);

      var willIgnore = false;
      if (!countFields.include(type) ||
        willIgnoreFromLabel(el) ||
        willIgnoreStaticWidgets(el) ||
        willDefaultIgnored(el, type) ||
        willIngoreDisabled(el))
         {
        willIgnore = true;
        // console.log('Ignoring field', id);
      }

      return willIgnore;
    }

    /*
     * Check for changes on the for
     */
    function setupFieldListeners() {
      // set event listener to all fields
      $$('.form-line').each(function(el) {
        var id = el.id.split('_')[1];

        // - Get inpt type and check if can be counted
        // - Get label of the element
        // - and do not include static widgets they meant to show data only
        if (willIgnoreField(el)) {
          return;
        }

        // do not add events to field list that is not required
        // only if onlyCountRequired is true
        if (onlyCountRequired) {
          if (el.hasClassName('form-field-hidden') || el.hasClassName('always-hidden')) {
            if (el.hasClassName('jf-required')) {
              hiddenList.push(el.id);
              // console.log('hidden internally', hiddenList);
            } else {
              // if no required class detected
              // check it from conditions it might be there
              //comented by Hayk, not sure what is doing this part,
              //if hidden and not required just need return
              return;
              /*
              if (JotForm.conditions.length > 0) {
                for (var c = 0; c < JotForm.conditions.length; c++) {
                  console.log(JotForm.conditions[c]);
                  if (JotForm.conditions[c].type === 'require') {
                    console.log(el);
                    var cactions = JotForm.conditions[c].action;
                    for (var t = 0; t < cactions.length; t++) {
                      // if we found the current id on the terms field id
                      // then its a hidden and required
                      if (Number(cactions[t].field) === Number(id) &&
                        cactions[t].visibility === 'Require') {
                        hiddenList.push(el.id);
                        console.log(el);
                        // console.log('hidden conditionally', hiddenList);
                      }
                    }
                  }
                }
              }
              */
            }

          } else if (!$$('#id_' + id + '[class*="required"]').first()) {
            return;
          }
        }
        // disable listeners for always-hidden fields if counts only required fields
        if (!onlyCountRequired && el.hasClassName('always-hidden')) {
          return;
        }

        // put the id to field list - to know if this field
        // is already filled up or not
        if (!(el.id in fieldList)) {
          fieldList[el.id] = false;
          //console.log('Adding', el.id, 'to fieldList', fieldList);
        }

        // put events to valid fields
        var element = $('id_' + id);
        var type = JotForm.getInputType(id);
        switch (type) {
          case 'file':
            setListener(element, getFieldEvent(type, 0));
            triggerEventIfHasContent(element, getFieldEvent(type, 0));
            if ($$('#id_' + id + ' input').first().readAttribute('multiple') === 'multiple') {
              setListener(element, getFieldEvent(type, 1), true);
              triggerEventIfHasContent(element, getFieldEvent(type, 1));
            }
            break;
          case 'datetime':
            setListener(element, getFieldEvent(type, 0));
            triggerEventIfHasContent(element, getFieldEvent(type, 0));
            $$('#id_' + id + ' select').each(function(el) {
              setListener($(el), getFieldEvent(type, 1));
              triggerEventIfHasContent($(el), getFieldEvent(type, 1), id);
            });
            break;
          case 'appointment':
            setListener($(el), getFieldEvent(type));
            triggerEventIfHasContent($('input_' + id + '_date'), getFieldEvent(type), id);
            break;
          case 'time':
            if (isNewDefaultTheme || isExtendedTheme) {
              fieldEvents['default'].forEach(function(event) {
                setListener(element, event);
                triggerEventIfHasContent(element, event);
              });
            } else {
              $$('#id_' + id + ' select').each(function(el) {
                setListener($(el), getFieldEvent(type));
                triggerEventIfHasContent($(el), getFieldEvent(type), id);
              });
            }
            break;
          case 'birthdate':
            $$('#id_' + id + ' select').each(function(el) {
              setListener($(el), getFieldEvent(type));
              triggerEventIfHasContent($(el), getFieldEvent(type), id);
            });
            break;
          case 'radio':
          case 'checkbox':
          case 'signature':
          case 'select':
          case 'number':
          case 'widget':
            fieldEvents[type].forEach(function(event) {
              if (type === 'widget') {
                element = $('input_' + id);
                JotForm.widgetsWithConditions.push(id);
              }

              setListener(element, event);
              triggerEventIfHasContent(element, event);
            });
            break;
          default:
            fieldEvents['default'].forEach(function(event) {
              setListener(element, event);
              triggerEventIfHasContent(element, event);
            });
            break;
        }
      });

      // this is for edit mode to update progress bar
      if (isEditMode() || JotForm.saveForm) {
        var intervalTimeout = 5000;
        var intervalSpeed = 100;
        var intervalCount = 0;
        var intervalID = setInterval(function() {
          intervalCount += intervalSpeed;
          if (intervalCount > intervalTimeout) {
            clearInterval(intervalID);
          } else if ($('JotFormPopulatedFields') && $('JotFormPopulatedFields').getValue().length > 0) {
            clearInterval(intervalID);
            // populatedIds holds the ids that was populated on edit mode (form.edit.mode.js)
            var populatedIds = $('JotFormPopulatedFields').getValue().split(',');

            populateField(0);

            function populateField(index) {
              var pid = populatedIds[index];
              var qid = pid.replace('q', 'id_');
              // only touch alredy on fieldlist
              // to work other filters like the required onl, etc
              if (qid in fieldList) {
                // get the el and handle that field to update the progress bar
                var el = $$('.form-line#' + qid).first();
                handleFieldList(el);
              }

              index++;
              if (index < populatedIds.length) {
                populateField(index);
              } else {
                updateProgressBar();
              }
            }
          }
        }, intervalSpeed);
      } else {
        // update progress bar
        updateProgressBar();
      }
    }

    /*
     * If we are ignoring hidden fields: reset the progress bar on page change
     */
    function listenForPageChange() {
      $$('.form-pagebreak-next').each(function(el) {
        el.observe('click', updateProgressBar);
      });
    }

    /**
     * Insert bar on screen and call library
     */
    function addBarToScreen() {
      var formWrapper = $$('.form-all').first();

      var source = '';
      var prId = 'id_'+progressBarqid;
      if (!isNewDefaultTheme && !isExtendedTheme) {
        source = '<div id="'+prId+'" class="progressBarContainer' + (fixedLayout ? ' fixed' : '') + '">';
        source += '    <div id="progressBarWidget"></div>';
        source += '    <div class="progressBarSubtitle">';
        source += '        <span id="progressPercentage">0% completed</span>';
        source += '        <span id="progressCompleted" style="margin-left:10px">0</span>';
        source += '        <span>/</span>';
        source += '        <span id="progressTotal"></span> <span id="status_text1">' + (onlyCountRequired ? ' ' + text_required_progress : text_fields_progress) + '.</span> ';
        source += '        <span id="progressSubmissionReminder" style="display:none; margin-left: 10px;">' + text_submit_progress + '.</span>';
        source += '    </div>';
        source += '</div>';
      } else {
        source = '<div id="'+prId+'"  class="progressBar-newDefaultTheme' + (fixedLayout ? ' fixed' : '') + '">';
        source += '   <div class="progressBarContainer">';
        source += '       <div id="progressBarWidget"></div>';
        source += '       <div class="progressBarSubtitle">';
        source += '           <div class="innerProgressBarSubtitle">';
        source += '               <span id="progressPercentage">0% completed</span>';
        source += '               <span id="progressSubmissionReminder" style="display:none; margin-left: 10px;">' + text_submit_progress + '.</span>';
        source += '               <span id="progressTextCompleted" style="margin-left: 2px;">Completed</span>'
        source += '           </div>'
        source += '           <div id="progressFieldTotal">'
        source += '               <span id="status_text1">' + (onlyCountRequired ? ' ' + text_required_progress : text_fields_progress) + '</span>'
        source += '               <span id="progressCompleted" style="margin-left:2px">0</span>';
        source += '               <span>/</span>';
        source += '               <span id="progressTotal"></span>';
        source += '           </div>'
        source += '       </div>';
        source += '   </div>';
        source += '</div>';
      }


      // we need to adjust the padding because jotform form
      // has its own padding added, depends on the viewport size
      var formPadding = parseInt($$('.jotform-form').first().getStyle('padding'));
      if (fixedLayout && formPadding === 0 && (!isNewDefaultTheme && !isExtendedTheme)) {
        // fix top margin with an empty container
        source += '<div class="progressBarContainer">&nbsp;</div>';
      }
      formWrapper.insert({
        top: source
      });

      // progressBar = new ProgressBar('progressBarWidget', {'height':'20px', 'width': '98%'});
      if (typeof theme !== 'undefined' && theme.length > 0 && theme !== '' && theme !== '{theme}') {
        theme = theme.replace(/\s+/g, '');
        theme = theme.charAt(0).toLowerCase() + theme.slice(1);
      } else {
        theme = 'islandBlue';
      }
      progressBar = progressJs('#progressBarWidget').setOptions({
        height: '20px',
        width: '100%',
        boxSizing: 'border-box',
        theme: theme
      }).start();

      if (isNewDefaultTheme || isExtendedTheme) {
        var progressBarElement = document.getElementsByClassName('progressjs-progress')[0].className;
        var progressBarElementClassList = progressBarElement.split(' ')[0];
        var classNameForNDT = progressBarElementClassList + ' progressjs-theme-newDefault';
        document.getElementsByClassName('progressjs-progress')[0].className = classNameForNDT;
      }
    }

    function isEditMode() {
      var mode = getQuerystring('mode');
      var sid = getQuerystring('sid');
      return mode && (mode === 'edit' || mode === 'inlineEdit' || mode === 'submissionToPDF') && sid;
    }

    /**
     * Get query string
     */
    function getQuerystring(key, default_) {
      if (default_ === null) default_ = false;

      key = key.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]');
      var regex = new RegExp('[\\?&]' + key + '=([^&#]*)');
      var qs = regex.exec(window.location.href);
      if (qs === null)
        return default_;
      else
        return decodeURIComponent(qs[1]);
    }

    function getFieldEvent(ftype, findex) {
      ftype = ftype in fieldEvents ? ftype : 'default';
      if (typeof findex !== 'undefined') {
        return fieldEvents[ftype][findex];
      } else {
        return fieldEvents[ftype];
      }
    }

    /**
     * Trim helper
     */
    function trim(str) {
      return str.replace(/^[\n\t ]+/, '').replace(/[\n\t ]+$/, '');
    }

    /**
     * Check if real array
     */
    function isArray(arr) {
      return Object.prototype.toString.call(arr) === '[object Array]';
    }

  }

  document.observe('dom:loaded', function() {

    setTimeout(function() {
      Element.prototype.triggerEvent = function(eventName) {
        if (document.createEvent) {
          var evt = document.createEvent('HTMLEvents');
          evt.initEvent(eventName, true, true);
          return this.dispatchEvent(evt);
        }

        if (this.fireEvent) return this.fireEvent('on' + eventName);
      }

      var bar = new ProgressBar();
      bar.init();
    }, 1000);
  });
})();
