'use strict';

// Полифиллы
(function (e) {
  e.matches = e.matches || e.mozMatchesSelector || e.msMatchesSelector || e.oMatchesSelector || e.webkitMatchesSelector;
  e.closest = e.closest || function closest(selector) {
    if (!this) return null;
    if (this.matches(selector)) return this;
    if (!this.parentElement) { return null }
    else return this.parentElement.closest(selector)
  };
}(Element.prototype));

(function (e) {
  var matches = e.matches || e.matchesSelector || e.webkitMatchesSelector || e.mozMatchesSelector || e.msMatchesSelector || e.oMatchesSelector;
  !matches ? (e.matches = e.matchesSelector = function matches(selector) {
    var matches = document.querySelectorAll(selector);
    var th = this;
    return Array.prototype.some.call(matches, function (e) {
      return e === th;
    });
  }) : (e.matches = e.matchesSelector = matches);
})(Element.prototype);

if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = function (callback, thisArg) {
    thisArg = thisArg || window;
    for (var i = 0; i < this.length; i++) {
      callback.call(thisArg, this[i], i, this);
    }
  };
}

(function () {
  document.addEventListener('DOMContentLoaded', function () {

    // Переменные
    var popup = document.querySelector('.popup');
    var popupCancelBtn = document.querySelector('.popup__cancel_btn');
    var popupDeleteBtn = document.querySelector('.popup__delete-btn');
    var utilPopup = document.querySelector('.util-popup');
    var specialistID;
    var specialistDivId;

    // Свайп
    var onSwipeLeft = function (evt) {
      if (evt.target) {
        hideDeleteBtns();
        evt.target.closest('.specialist').classList.add('specialist--left');
      }
    };

    var onSwipeRight = function (evt) {
      if (evt.target) {
        evt.target.closest('.specialist').classList.remove('specialist--left');
      }
    };

    var addSwipeListener = function (list) {
      list.forEach(function (item) {
        var specialist = new Hammer(item);
        specialist.on('swipeleft', onSwipeLeft);
        specialist.on('swiperight', onSwipeRight);
      });
    };

    // Скрывает кнопки уделения специалистов
    var hideDeleteBtns = function () {
      var specialists = document.querySelectorAll('.specialist--left');
      specialists.forEach(function (specialist) {
        specialist.classList.remove('specialist--left');
      });
    }

    // Открывает окно подтверждения удаления специалиста
    var onPressDelete = function (evt) {
      specialistDivId = evt.target.closest('.specialist').getAttribute('id');
      specialistID = specialistDivId.slice(5);
      popup.classList.add('popup--active');
      popupDeleteBtn.addEventListener('click', send);
      popupCancelBtn.addEventListener('click', closePopup);
    };

    var addDeleteListener = function (list) {
      list.forEach(function (item) {
        item.addEventListener('click', onPressDelete);
      });
    };

    // Отменяет удаление специалиста
    var closePopup = function () {
      popup.classList.remove('popup--active');
      popupDeleteBtn.removeEventListener('click', send);
      popupCancelBtn.removeEventListener('click', closePopup);
      specialistID = undefined;
      specialistDivId = undefined;
      hideDeleteBtns();
    };

    // ajax-запрос
    var sendXHR = function (data) {
      var xhr = new XMLHttpRequest();
      xhr.responseType = 'json';
      xhr.timeout = 10000;

      xhr.addEventListener('load', function () {
        if (xhr.status === 200) {
          hideSpecialist(specialistDivId);
          showResult(xhr.response.result);
        } else {
          showResult('Ошибка. Статус ответа: ' + xhr.status + ' ' + xhr.statusText);
        }
      });
      xhr.addEventListener('error', function () {
        showResult('Произошла ошибка');
      });
      xhr.addEventListener('timeout', function () {
        showResult('Истекло время ожидания: ' + xhr.timeout + 'мс');
      });
      xhr.open('GET', 'deleteSpecialist.json?_=' + new Date().getTime(), true);
      xhr.send(data);
    };

    // отправляет запрос на удаление специалиста
    var send = function () {
      popup.classList.remove('popup--active');
      popup.classList.remove('popup--active');
      popupDeleteBtn.removeEventListener('click', send);
      popupCancelBtn.removeEventListener('click', closePopup);
      sendXHR(specialistID);
      hideDeleteBtns();
    };

    // Скрывает div  с удаленным специалистом
    var hideSpecialist = function (specialistDivId) {
      document.querySelector('#' + specialistDivId).remove();
    }

    // Показывает результат удаления
    var showResult = function (message) {
      utilPopup.textContent = message;
      utilPopup.classList.add('util-popup--active');
      setTimeout(function () {
        utilPopup.classList.remove('util-popup--active')
      }, 3000);
      specialistID = undefined;
      specialistDivId = undefined;
    };


    addSwipeListener(document.querySelectorAll('.specialist'));
    addDeleteListener(document.querySelectorAll('.specialist__delete-btn'));

  });
})();
