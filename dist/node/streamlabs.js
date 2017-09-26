'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _eventemitter = require('eventemitter3');

var _eventemitter2 = _interopRequireDefault(_eventemitter);

var _socket = require('socket.io-client');

var _socket2 = _interopRequireDefault(_socket);

var _helpers = require('./helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var StreamlabsClient = function (_EventEmitter) {
  _inherits(StreamlabsClient, _EventEmitter);

  function StreamlabsClient(options) {
    _classCallCheck(this, StreamlabsClient);

    var _this = _possibleConstructorReturn(this, (StreamlabsClient.__proto__ || Object.getPrototypeOf(StreamlabsClient)).call(this));

    Object.defineProperty(_this, 'baseURL', {
      enumerable: true,
      writable: true,
      value: 'https://sockets.streamlabs.com/?token='
    });
    Object.defineProperty(_this, 'token', {
      enumerable: true,
      writable: true,
      value: null
    });
    Object.defineProperty(_this, 'client', {
      enumerable: true,
      writable: true,
      value: null
    });
    Object.defineProperty(_this, 'rawEvents', {
      enumerable: true,
      writable: true,
      value: []
    });
    Object.defineProperty(_this, 'idTable', {
      enumerable: true,
      writable: true,
      value: new Set()
    });
    var token = options.token,
        emitTests = options.emitTests,
        rawEvents = options.rawEvents;


    if (!token || typeof token !== 'string') {
      throw new Error('StreamlabsClient constructor expected \'token\' to be a string with length longer than 0.');
    }

    if (Array.isArray(rawEvents)) {
      _this.rawEvents = rawEvents;
    }

    Object.assign(_this, {
      token: token,
      emitTests: !!emitTests
    });
    return _this;
  }

  _createClass(StreamlabsClient, [{
    key: 'createClient',
    value: function createClient() {
      var baseURL = this.baseURL,
          token = this.token,
          client = this.client;


      if (client) {
        return;
      }

      this.client = (0, _socket2.default)(baseURL + token, {
        autoConnect: false,
        // transports: ['websocket'],
        forceNode: true,
        forceJSONP: false
        // debug: true,
      });

      this.hookEventListeners();
    }
  }, {
    key: 'connect',
    value: function connect() {
      if (!this.client) {
        this.createClient();
      }

      this.client.connect();
    }
  }, {
    key: 'disconnect',
    value: function disconnect() {
      if (this.client) {
        this.client.disconnect();
      }
    }
  }, {
    key: 'handleEvent',
    value: function handleEvent(event) {
      var message = event.message,
          type = event.type;

      // eslint-disable-next-line no-underscore-dangle

      if (this.idTable.has(message._id)) {
        return;
      }

      // eslint-disable-next-line no-underscore-dangle
      this.idTable.add(message._id);

      if (!this.emitTests && message && message.isTest) {
        return;
      }

      var isTest = !!message.isTest;

      switch (type) {
        case 'follow':
          {
            this.emit('follow', _extends({}, message, {
              isTest: isTest
            }));

            break;
          }

        case 'subscription':
          {
            var isResub = !!message.sub_type && message.sub_type === 'resub';

            if (isResub) {
              this.emit('resubscription', _extends({}, message, {
                months: Number((0, _helpers.removeCommas)(message.months)) || 0,
                formattedMonths: message.months,
                isTest: isTest
              }));
            } else {
              this.emit('subscription', _extends({}, message, {
                isTest: isTest
              }));
            }

            break;
          }

        case 'donation':
          {
            this.emit('donation', _extends({}, message, {
              amount: Number((0, _helpers.removeNonNumeric)(message.amount)),
              formattedAmount: (message.formattedAmount || message.formatted_amount || '').toString(),
              currency: message.currency || 'USD',
              isTest: isTest
            }));

            break;
          }

        case 'host':
          {
            this.emit('host', _extends({}, message, {
              viewers: Number((0, _helpers.removeNonNumeric)(message.viewers)),
              formattedViewers: message.viewers.toString(),
              isTest: isTest
            }));

            break;
          }

        case 'bits':
          {
            this.emit('bits', _extends({}, message, {
              amount: Number((0, _helpers.removeCommas)(message.amount)) || 0,
              formattedAmount: message.amount.toString(),
              isTest: !!message.isTest
            }));

            break;
          }

        default:
          {
            this.emit(type, _extends({}, message, {
              isTest: isTest
            }));

            break;
          }
      }
    }
  }, {
    key: 'hookEventListeners',
    value: function hookEventListeners() {
      var _this2 = this;

      this.client.on('event', function (event) {
        try {
          if (Array.isArray(event.message)) {
            event.message.forEach(function (message) {
              _this2.handleEvent({
                type: event.type,
                for: event.for || '',
                message: message
              });
            });
          }
        } catch (error) {
          _this2.emit('error', error);
        }
      });

      this.rawEvents.forEach(function (eventName) {
        _this2.hookRawEventListener(eventName);
      });
    }
  }, {
    key: 'hookRawEventListener',
    value: function hookRawEventListener(eventName) {
      var _this3 = this;

      this.client.on(eventName, function () {
        for (var _len = arguments.length, data = Array(_len), _key = 0; _key < _len; _key++) {
          data[_key] = arguments[_key];
        }

        _this3.emit.apply(_this3, [eventName].concat(data));
      });
    }
  }]);

  return StreamlabsClient;
}(_eventemitter2.default);

exports.default = StreamlabsClient;
//# sourceMappingURL=streamlabs.js.map