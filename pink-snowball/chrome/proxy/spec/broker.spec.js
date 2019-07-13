/* global expect, it, describe, spyOn, Broker */

/*
jasmine tests for Snowflake broker
*/

// fake xhr
// class XMLHttpRequest
class XMLHttpRequest {
  constructor() {
    this.onreadystatechange = null;
  }
  open() {}
  setRequestHeader() {}
  send() {}
};

XMLHttpRequest.prototype.DONE = 1;


describe('Broker', function() {

  it('can be created', function() {
    var b;
    b = new Broker('fake');
    expect(b.url).toEqual('https://fake/');
    expect(b.id).not.toBeNull();
  });

  describe('getClientOffer', function() {

    it('polls and promises a client offer', function(done) {
      var b, poll;
      b = new Broker('fake');
      // fake successful request and response from broker.
      spyOn(b, '_postRequest').and.callFake(function() {
        b._xhr.readyState = b._xhr.DONE;
        b._xhr.status = Broker.STATUS.OK;
        b._xhr.responseText = 'fake offer';
        return b._xhr.onreadystatechange();
      });
      poll = b.getClientOffer();
      expect(poll).not.toBeNull();
      expect(b._postRequest).toHaveBeenCalled();
      return poll.then(function(desc) {
        expect(desc).toEqual('fake offer');
        return done();
      }).catch(function() {
        fail('should not reject on Broker.STATUS.OK');
        return done();
      });
    });

    it('rejects if the broker timed-out', function(done) {
      var b, poll;
      b = new Broker('fake');
      // fake timed-out request from broker
      spyOn(b, '_postRequest').and.callFake(function() {
        b._xhr.readyState = b._xhr.DONE;
        b._xhr.status = Broker.STATUS.GATEWAY_TIMEOUT;
        return b._xhr.onreadystatechange();
      });
      poll = b.getClientOffer();
      expect(poll).not.toBeNull();
      expect(b._postRequest).toHaveBeenCalled();
      return poll.then(function(desc) {
        fail('should not fulfill on Broker.STATUS.GATEWAY_TIMEOUT');
        return done();
      }, function(err) {
        expect(err).toBe(Broker.MESSAGE.TIMEOUT);
        return done();
      });
    });

    it('rejects on any other status', function(done) {
      var b, poll;
      b = new Broker('fake');
      // fake timed-out request from broker
      spyOn(b, '_postRequest').and.callFake(function() {
        b._xhr.readyState = b._xhr.DONE;
        b._xhr.status = 1337;
        return b._xhr.onreadystatechange();
      });
      poll = b.getClientOffer();
      expect(poll).not.toBeNull();
      expect(b._postRequest).toHaveBeenCalled();
      return poll.then(function(desc) {
        fail('should not fulfill on non-OK status');
        return done();
      }, function(err) {
        expect(err).toBe(Broker.MESSAGE.UNEXPECTED);
        expect(b._xhr.status).toBe(1337);
        return done();
      });

    });

  });

  it('responds to the broker with answer', function() {
    var b = new Broker('fake');
    spyOn(b, '_postRequest');
    b.sendAnswer('fake id', 123);
    expect(b._postRequest).toHaveBeenCalledWith('fake id', jasmine.any(Object), 'answer', '123');
  });

  it('POST XMLHttpRequests to the broker', function() {
    var b = new Broker('fake');
    b._xhr = new XMLHttpRequest();
    spyOn(b._xhr, 'open');
    spyOn(b._xhr, 'setRequestHeader');
    spyOn(b._xhr, 'send');
    b._postRequest(0, b._xhr, 'test', 'data');
    expect(b._xhr.open).toHaveBeenCalled();
    expect(b._xhr.setRequestHeader).toHaveBeenCalled();
    expect(b._xhr.send).toHaveBeenCalled();
  });

});
