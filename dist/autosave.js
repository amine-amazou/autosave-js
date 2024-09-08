/*!
    AutoSave - 1.0.0
    Author: Amine Amazou
    Description: AutoSave is a simple, lightweight JavaScript library that saves user inputs automatically, making your web app more user-friendly. It stores form data or other inputs in session storage, so if the user reloads the page, their progress is not lost.
    Copyright © 2024 amazou
    Licensed under the MIT license.
    https://github.com/amine-amazou/autosave-js/blob/main/LICENSE
*/

;(function() {
    "use strict"
    class Helpers {
        static remember({ input,  value }) {
            switch (input.type) {
                case 'checkbox':
                    input.checked = (value == 'true');
                    break;
                case 'radio':
                    if(input.value == value) input.checked = true;
                    break;
                default:
                    input.value = value;
                    break;
            }
            
        }
        static prefix(inputId, formId) {
            if(formId) return `autosave-${formId}-${inputId}` 
            else return `autosave-${inputId}`;
        }

        static id(input) {
            if(input.type !== 'checkbox') return input.id
            else return `${input.id}-${input.value}`;
        }

        static setup({ input, formId }) {
            let inputId = this.id(input);
            let value = sessionStorage.getItem(this.prefix(inputId, formId));
            if(value == null) {
                switch (input.type) {
                    case 'checkbox':
                        sessionStorage.setItem(this.prefix(inputId, formId), false);
                        break;
                    case 'radio':
                        sessionStorage.setItem(this.prefix(inputId, formId), "");
                        break;
                    default:
                        sessionStorage.setItem(this.prefix(inputId, formId), input.value);
                        break;
                }
                
                return;
            }
            this.remember({ 
                input,
                value 
            })
        }

        static handle(input, formId = false) {
            
            this.setup({ 
                input, 
                formId 
            });
            
            input.addEventListener('input', () => {
                let inputId = this.id(input);
                let value = input.type == 'checkbox' ? input.checked : input.value;
                value !== "" 
                    ? sessionStorage.setItem(this.prefix(inputId, formId), value)
                    : delete sessionStorage[this.prefix(inputId, formId)]
            })

        }

        static sessionKeys(prefix) {
            return Object.keys(sessionStorage)
                .filter(key => key.startsWith(prefix))
        }

        static destroy(sessionKey) {
            delete sessionStorage[sessionKey];
        }

        static empty(inputId) {
            if(typeof(inputId) !== 'object') inputId = document.getElementById(inputId);
            inputId.localName !== 'select' 
                ? inputId.type !== 'color'
                    ? inputId.type !== 'radio' && inputId.type !== 'checkbox'
                        ? inputId.value = '' 
                        : inputId.checked = false
                    : inputId.value = '#000000'
                : inputId.value = inputId.children[0].value
        }

        static splitKey(key) {
            return key.split('-').reverse();
        }

        static inputs(id = false) {
            if(id) 
                return document.querySelectorAll(`form[id='${id}'] > input:not([except], [type='submit'], [type='hidden'], [type='password']), form[id='${id}'] select:not([except]), form[id='${id}'] textarea:not([except])`)
            else return document.querySelectorAll("form[autosave] > input:not([except], [type='submit'], [type='hidden'], [type='password']), input[autosave], form[autosave] select:not([except]), form[autosave] textarea:not([except])");
        }

        static excepts(id = false) {
            if(id) return document.querySelectorAll(`form[id='${id}'] input[except]`);
            else return document.querySelectorAll(`form[autosave] input[except]`);
        }

    }

    class AutoSave {
        f;

        focus(e) {
            if(typeof(e) == 'object') this.f = e.target.id
            else tbis.f = e;
            return this;
        }

        use(callback = false, f = false) {
            let form = {};
            f && focus(f);

            let prefix = Helpers.prefix(this.f);
            Helpers.sessionKeys(prefix)
                .forEach(key => {
                    let splitedKey = Helpers.splitKey(key);
                    if(splitedKey.length <= 3) {
                        form[splitedKey[0]] = sessionStorage.getItem(key)
                    } else {
                        if(!(Object.keys(form).includes(splitedKey[1]))) form[splitedKey[1]] = new Array();
                        if(sessionStorage.getItem(key) == 'true') form[splitedKey[1]].push(splitedKey[0]);
                    }
                    
                })
            Helpers.excepts().forEach(input => form[input.id] = input.value)
            if(callback) {
                callback(form);
                return this;
            } 
            return form;
        }

        forget(f = false) {
            f && focus(f);
        
            Helpers.inputs(this.f)
                .forEach(input => {
                    Helpers.empty(input)
                    Helpers.destroy(Helpers.prefix(Helpers.id(input), input.form.id));
                });
            
                //Helpers.empty(this.f);
                //Helpers.destroy(Helpers.prefix(this.f));

            Helpers.excepts(this.f).forEach(input => Helpers.empty(input))
            return true;
        }

        apply() {
            Helpers.inputs()
                .forEach(input => Helpers.handle(input, input.form?.id))
            return this;
        }
    }
    window.AutoSave = new AutoSave().apply();
})();
