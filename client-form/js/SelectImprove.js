export default
class SelectImprove {

  constructor(select) {
    this.select = select;

    this.isMouseOnOptions = false;
    this.isOptionsOpened = false;
    
    this.onOptionClick = this.onOptionClick.bind(this);    
    this.onOptionsEnter = this.onOptionsEnter.bind(this);
    this.onOptionsLeave = this.onOptionsLeave.bind(this);
    this.bodyPressed = this.bodyPressed.bind(this);
    this.selectFocused = this.selectFocused.bind(this);
    this.selectBlur = this.selectBlur.bind(this);
    this.selectPressed = this.selectPressed.bind(this);

    document.addEventListener("mousedown", this.bodyPressed);
    select.addEventListener("focus", this.selectFocused);
    select.addEventListener("blur", this.selectBlur);
    select.addEventListener("mousedown", this.selectPressed);

    this.imitOptions = this.formOptions(); // элемент с имитируемыми опциями
    SelectImprove.insertAfter(select, this.imitOptions);
  }

  static insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  }

  static  collectionToArray(collection) {
    let a = [];

    for(let i = 0; i < collection.length; i++) {
      a.push(collection[i]);
    }

    return a
  }

  formOptions() {
    // Создаёт элемент с имитируемыми опциями, по опциям из select
    //
    // При multiple элемент имеет такую структуру:
    // <div .options [.options-active]>
    //   ...
    //   <div .option [.option-active] value="val">
    //     <label>
    //       <div>...slot...</div>
    //       <input type="checkbox">
    //     </label>
    //   </div>
    //   ...
    // </div>
    //
    //
    // При не multiple элемент имеет такую структуру:
    // <div .options [.options-active]>
    //   ...
    //   <div .option [.option-active] value="val">...slot...</div>
    //   ...
    // </div>

    let nativeOptionsList = SelectImprove.collectionToArray(this.select.options);

    let imitOptions = document.createElement("div");
    imitOptions.className = "options";
    imitOptions.addEventListener("mouseenter", this.onOptionsEnter);
    imitOptions.addEventListener("mouseleave", this.onOptionsLeave);

    let option;
    let label, checkbox, labelText;

    nativeOptionsList.forEach((nativeOption) => {
      option = document.createElement("div");
      option.className = "option";

      option.setAttribute("value", nativeOption.value);


      if(this.select.hasAttribute("multiple")) {
        imitOptions.classList.add("options-multiple");
        checkbox = document.createElement("input");
        checkbox.setAttribute("type", "checkbox");

        labelText = document.createElement("div");
        labelText.innerHTML = nativeOption.innerHTML;

        label = document.createElement("label");
        label.appendChild(labelText);
        label.appendChild(checkbox);
        
        option.appendChild(label);
      }else {
        option.innerHTML = nativeOption.innerHTML;
      }

      if(nativeOption.selected) {
        option.classList.add("option-active");
      }
      if(nativeOption.hasAttribute("disabled")) {
        option.setAttribute("disabled", "");
      }
      
      option.addEventListener("click", this.onOptionClick);

      imitOptions.appendChild(option);
    });

    return imitOptions;
  }


  //###########################################
  //# Обработчики состаяния имитируемой опции #
  //###########################################
  onOptionClick(event) {
    // 1) Резервирует select, option (эмитатор), value из option
    // 2) Если select multiple, то по состоянию чекбокса опции, переключает
    //    класс эмитируемой опции и selected состояние скрытой опции
    // 3) Если select не multiple, то устанавливает в select.value значение
    //    нажатой опции и закрывает список опций. На выбранную опцию-эмитатор
    //    ставит класс option-active
    // 4) После всех изменений, эмитирует событие change на select. v-model
    //    Vue реагирует на это и получает значения с multiple и не multiple
    //    select.


    // 1.
    let select = this.select;
    let option = event.target; // нажатая эмитируемая опция
    while(option.classList[0] != "option") option = option.parentElement;
    let value = option.getAttribute("value");


    if(option.hasAttribute("disabled")) {
      return true;
    }

    // 2.
    if(select.hasAttribute("multiple")) {
      let checkbox = option.getElementsByTagName("input")[0];

      let hiddenOption;

      SelectImprove.collectionToArray(select.options).forEach( (optionEl) => {
        if(optionEl.value == value) {
          hiddenOption = optionEl;
        }
      });

      if(checkbox.checked) {
        option.classList.add("option-active");
        hiddenOption.selected = true;
      }else {
        option.classList.remove("option-active");
        hiddenOption.selected = false;
      }

    }else {
      // 3.
      select.value = option.getAttribute("value");
      SelectImprove.collectionToArray(this.imitOptions.children).forEach((imitOption) => {
        // проходим по эмитируемым опциям и удаляем класс option-active
        imitOption.classList.remove("option-active");
      });

      option.classList.add("option-active");

      this.closeMenu();
    }

    select.dispatchEvent(new Event("change"));
  }


  //#####################################
  //# Функции работы с имитируемым меню #
  //#####################################
  openMenu() {
    this.imitOptions.classList.add("options-active");
    this.isOptionsOpened = true;
  }

  closeMenu() {
    this.imitOptions.classList.remove("options-active");
    this.isOptionsOpened = false;
  }


  //###########################################
  //# Обработчики состаяния имитируемого меню #
  //###########################################
  onOptionsEnter(event) {
    this.isMouseOnOptions = true;
  }

  onOptionsLeave(event) {
    this.isMouseOnOptions = false;
  }

  bodyPressed(event) {
    // 1) При нажатии по body, с учётом распространения, если мышь не на меню,
    //    и оно открыто, то меню закрывается
    if(!this.isMouseOnOptions && this.isOptionsOpened) {
      this.closeMenu();
    }
  }

  selectPressed(event) {
    // 1) Сброс нажатия (дефолтное меню не откроется) и распространения
    // 2) Если было открыто меню при нажатии на select, то меню закроется и
    //    вызовется blur
    // 3) Если меню было закрыто, то на элемент упадёт фокус

    // 1.
    event.preventDefault();
    event.stopPropagation();

    if(this.isOptionsOpened) {
      // 2.
      this.select.blur();
    }else {
      // 3.
      this.select.focus();
    }
    
  }

  selectFocused(event) {
    // 1) При фокусе на элементе - открывает меню

    this.openMenu();
  }

  selectBlur(event) {
    // 1) Если при blur мышь не на списке опций, то закрыть список

    if(!this.isMouseOnOptions) {
      this.closeMenu();
    }
  }

}