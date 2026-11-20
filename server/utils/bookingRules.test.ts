import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canTransitionBookingStatus,
  validateServiceDate,
  generateBookingCode,
  computeAverageRating,
  validateRegistrationInput,
  validateBookingInput,
} from './bookingRules';

test('worker can accept or reject their own Pending booking', () => {
  assert.equal(
    canTransitionBookingStatus({
      currentStatus: 'Pending',
      nextStatus: 'Accepted',
      actorRole: 'worker',
      isAssignedWorker: true,
      isBookingCustomer: false,
    }).allowed,
    true
  );

  assert.equal(
    canTransitionBookingStatus({
      currentStatus: 'Pending',
      nextStatus: 'Rejected',
      actorRole: 'worker',
      isAssignedWorker: true,
      isBookingCustomer: false,
    }).allowed,
    true
  );
});

test('worker cannot accept another worker booking or complete a Pending booking', () => {
  const wrongWorker = canTransitionBookingStatus({
    currentStatus: 'Pending',
    nextStatus: 'Accepted',
    actorRole: 'worker',
    isAssignedWorker: false,
    isBookingCustomer: false,
  });
  assert.equal(wrongWorker.allowed, false);

  const skipAccept = canTransitionBookingStatus({
    currentStatus: 'Pending',
    nextStatus: 'Completed',
    actorRole: 'worker',
    isAssignedWorker: true,
    isBookingCustomer: false,
  });
  assert.equal(skipAccept.allowed, false);

  const validComplete = canTransitionBookingStatus({
    currentStatus: 'Accepted',
    nextStatus: 'Completed',
    actorRole: 'worker',
    isAssignedWorker: true,
    isBookingCustomer: false,
  });
  assert.equal(validComplete.allowed, true);
});

test('customer can only cancel their own Pending booking and never accept/complete', () => {
  assert.equal(
    canTransitionBookingStatus({
      currentStatus: 'Pending',
      nextStatus: 'Cancelled',
      actorRole: 'customer',
      isAssignedWorker: false,
      isBookingCustomer: true,
    }).allowed,
    true
  );

  assert.equal(
    canTransitionBookingStatus({
      currentStatus: 'Accepted',
      nextStatus: 'Cancelled',
      actorRole: 'customer',
      isAssignedWorker: false,
      isBookingCustomer: true,
    }).allowed,
    false
  );

  assert.equal(
    canTransitionBookingStatus({
      currentStatus: 'Pending',
      nextStatus: 'Accepted',
      actorRole: 'customer',
      isAssignedWorker: false,
      isBookingCustomer: true,
    }).allowed,
    false
  );
});

test('validateServiceDate rejects past and invalid dates, accepts today and future', () => {
  const ref = new Date('2026-11-20T10:00:00Z');
  assert.equal(validateServiceDate('2026-11-19', ref).valid, false);
  assert.equal(validateServiceDate('2026-02-30', ref).valid, false);
  assert.equal(validateServiceDate('not-a-date', ref).valid, false);
  assert.equal(validateServiceDate('2026-11-20', ref).valid, true);
  assert.equal(validateServiceDate('2026-12-05', ref).valid, true);
});

test('computeAverageRating rounds to one decimal place', () => {
  assert.deepEqual(computeAverageRating([]), { averageRating: 0, totalReviews: 0 });
  assert.deepEqual(computeAverageRating([5, 4, 5]), { averageRating: 4.7, totalReviews: 3 });
  assert.deepEqual(computeAverageRating([4, 4, 5, 5]), { averageRating: 4.5, totalReviews: 4 });
});

test('generateBookingCode formats HE-YYYY-NNNNNN', () => {
  const code = generateBookingCode(new Date('2026-11-20T00:00:00Z'), 12345);
  assert.match(code, /^HE-2026-\d{6}$/);
});

test('validateRegistrationInput & validateBookingInput catch missing/invalid fields', () => {
  const regErrors = validateRegistrationInput({
    name: 'A',
    email: 'bad-email',
    phone: '123',
    password: '123',
    location: '',
    role: 'admin',
  });
  assert.equal(regErrors.length, 6);

  const bookErrors = validateBookingInput(
    {
      workerId: '',
      serviceCategory: '',
      serviceDate: '2020-01-01',
      preferredTime: '',
      address: 'Short',
    },
    new Date('2026-11-20T00:00:00Z')
  );
  assert.equal(bookErrors.length, 5);
});
