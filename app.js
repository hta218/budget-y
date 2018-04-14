// BUDGET CONTROLLER
var budgetController = (() => {

  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  }

  // dont use arrow function for declaring a object method
  // ref: https://wesbos.com/arrow-function-no-no/
  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round(100 * (this.value / totalIncome));
    } else {
      this.percentage = -1;
    }
  }

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  }

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  }

  var calculate = (type) => {
    var sum = 0;
    data.allItems[type].forEach((item) => {
      sum += item.value;
    });
    data.totals[type] = sum;
  }

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  }

  return {
    addItem: (type, des, val) => {
      var newItem, allItems, ID;
      
      // Create new ID
      allItems = data.allItems[type];
      if (allItems.length > 0) {
        ID = allItems[allItems.length - 1].id + 1;
      } else {
        ID = 0;
      }

      if (type === 'exp') {
        newItem = new Expense(ID, des, val)
      } else if (type == 'inc') {
        newItem = new Income(ID, des, val);
      }

      allItems.push(newItem);
      return newItem;
    },

    calculateBudget: () => {
      // calculate total income and expenses (then update)
      calculate('inc');
      calculate('exp');

      // calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      // calculate the percentage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round(100 * (data.totals.exp / data.totals.inc));
      } else {
        data.percentage = -1;
      }
    },

    deleteItem: (type, id) => {
      var ids = data.allItems[type].map((item) => {
        return item.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, index + 1)
      }
    },

    calculatePercentages: () => {
      data.allItems.exp.forEach((cur) => {
        
        cur.calcPercentage(data.totals.inc);
      })
    },

    getPercentages: () => {
      var allPerc = data.allItems.exp.map((exp) => {
        return exp.percentage;
      });

      return allPerc;
    },

    getBudget: () => {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      }
    },

    testing: () => {
      console.log(data);
    }
  }

})();

// UI CONTROLLER
var UIController = (() => {
  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputButton: '.add__btn',
    container: {
      budget: '.container',
      inc: '.income__list',
      exp: '.expenses__list',
    },
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  }

  
  var formatNumber = (num, type) => {
    var numSplit, intDigits, sign;
    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');
    int = numSplit[0];

    intDigits = int.split("");
    int = '';

    intDigits.forEach((digit, index) => {
      if (index && ((intDigits.length - index) % 3 === 0)) {
        int = int + ',' + digit;
      } else {
        int += digit;
      }
    });

    dec = numSplit[1];
    sign = type === 'inc' ? "+" : "-";

    return `${sign} ${int}.${dec}`;
  }

  return {
    getInput: () => {
      return {
        type: document.querySelector(DOMstrings.inputType).value, // either inc or exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      }
    },

    addListItem: (obj, type) => {
      var html, newHtml, percentage, element;
      percentage = obj.percentage;
      // Create HTMl strings with placeholder text then replace with actual data
      html = `<div class="item clearfix" id="${type}-${obj.id}">
                  <div class="item__description">${obj.description}</div>
                  <div class="right clearfix">
                      <div class="item__value">${formatNumber(obj.value, type)}</div>
                      ${!percentage ? '' : `<div class="item__percentage">${percentage}%</div>`}
                      <div class="item__delete">
                          <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                      </div>
                  </div>
              </div>`;

      // Insert the HTML into the DOM
      element = DOMstrings.container[type];
      document.querySelector(element).insertAdjacentHTML('beforeend', html);
    },

    deleteListItem: (itemId) => {
      var item = document.querySelector(`#${itemId}`);
      item.parentNode.removeChild(item);
    },

    clearFields: () => {
      var fieldsDOM = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
      
      fieldsDOM.forEach((field) => {
        field.value = '';
      });

      fieldsDOM[0].focus();
    },

    displayBudget: (obj) => {
      var type;
      type = obj.budget > 0 ? 'inc' : 'exp';

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

      var displayPercentage = obj.percentage > 0 ? obj.percentage + '%' : '--'
      document.querySelector(DOMstrings.percentageLabel).textContent = displayPercentage;
    },

    displayPercentages: (percentages) => {
      var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

      fields.forEach((field, index) => {
        if (percentages[index] > 0) {
          field.textContent = percentages[index] + '%'
        } else {
          field.textContent = '--';
        }
      });
    },

    displayMonth: () => {
      var now, year;
      const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      now = new Date();
      month = monthNames[now.getMonth()];

      year = now.getFullYear();

      document.querySelector(DOMstrings.dateLabel).textContent = `${month} ${year}`;
    },

    changeType: function() {
      var fields = document.querySelectorAll(
        DOMstrings.inputType  + ',' +
        DOMstrings.inputDescription  + ',' +
        DOMstrings.inputValue
      );

      fields.forEach((field) => {
        field.classList.toggle('red-focus');
      });

      document.querySelector(DOMstrings.inputButton).classList.toggle('red');
    },

    getDOMstrings: () => {
      return DOMstrings;
    }
  }
})();

// GLOBAL APP CONTROLLER
var controller = ((budgetCtrl, UICtrl) => {
  var setUpEventListeners = () => {
    DOMstrings = UICtrl.getDOMstrings();
    
    document.querySelector(DOMstrings.inputButton).addEventListener('click', () => {
      ctrlAddItem();
    });
  
    document.addEventListener('keypress', (event) => {
      if (event.keycode === 13 || event.which === 13) {
        ctrlAddItem(); 
      }
    });

    document.querySelector(DOMstrings.container.budget).addEventListener('click', ctrlDeleteItem);

    document.querySelector(DOMstrings.inputType).addEventListener('change', UICtrl.changeType);
  }

  var updateBudget = () => {
    // 1. Calculate the budget
    budgetCtrl.calculateBudget();

    // 2. Return the budget
    var budget = budgetCtrl.getBudget();

    // 3. Display the budget opn the UI
    UICtrl.displayBudget(budget);
  };

  var updatePercentages = () => {
    // 1. Calculate percentages
    budgetCtrl.calculatePercentages();
    
    // 2. Read percentages from the budget controller
    var percentages = budgetCtrl.getPercentages();

    // 3. Update the UI with the new percentages
    UICtrl.displayPercentages(percentages);
  }

  var ctrlAddItem = () => {
    // 1. Get the filled input data
    var input = UICtrl.getInput();
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // 2. Add the item to the budget controller
      var newItem = budgetCtrl.addItem(input.type, input.description, input.value);
 
      // 3. Add the item to the UI then clear Input fields
      UICtrl.addListItem(newItem, input.type);
      UICtrl.clearFields();

      // 4. Calculate and update budget
      updateBudget();

      // 5. Calculate and update percentages
      updatePercentages();
    }
  }

  var ctrlDeleteItem = (event) => {
    var itemId, type, id;

    itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemId) {
      // 1. Get item id and type
      type = itemId.split('-')[0];
      id = parseInt(itemId.split('-')[1]);

      // 2. Delete the item from datastructure
      budgetCtrl.deleteItem(type, id)

      // 3. Delete the item from the UI
      UICtrl.deleteListItem(itemId);

      // 4. Update and show the new budget
      updateBudget();

      // 5. Calculate and update percentages
      updatePercentages();
    }
  }

  return {
    init: () => {
      console.log('App has started');
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      setUpEventListeners();
    }
  }


})(budgetController, UIController);


controller.init();