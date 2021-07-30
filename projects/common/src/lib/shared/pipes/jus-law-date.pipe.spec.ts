import { DatePipe } from '@angular/common';
import { JusLawDatePipe } from '@jl/common/shared/pipes/jus-law-date.pipe';

describe('JusLawDatePipe', () => {
  // This pipe is a pure, stateless function so no need for BeforeEach
  const locale = 'en';
  const pipe = new JusLawDatePipe(locale);
  const angularPipe = new DatePipe(locale);
  const transformFormat = 'MMM dd, yyyy, h:mm a';
  const shortTransformFormat = 'h:mm a';

  let now: Date;
  let today: Date;
  let yesterday: Date;
  let past: Date;
  let future: Date;

  beforeEach(() => {
    now = new Date(Date.now());

    // Init today date.
    today = new Date(Date.now());
    today.setHours(1, 1);

    // Init yesterday date.
    yesterday = new Date(Date.now());
    yesterday.setDate(yesterday.getDate() - 1);

    // Init past date.
    past = new Date();
    past.setFullYear(2001);
    past.setDate(10);
    past.setMonth(2);

    // Init future date.
    future = new Date();
    future.setFullYear(2019);
    future.setDate(10);
    future.setMonth(11);
  });

  it('Should set "Today" on current day', () => {
    const shortDate = angularPipe.transform(
      today.toString(),
      shortTransformFormat,
    );
    expect(pipe.transform(today.toString())).toBe('Today, ' + shortDate);
  });

  it('Should not set "Today" on different from current day days', () => {
    expect(pipe.transform(past.toString())).not.toMatch(/^(Today)/);
    expect(pipe.transform(future.toString())).not.toMatch(/^(Today)/);
    expect(pipe.transform(yesterday.toString())).not.toMatch(/^(Today)/);
  });

  it('Should set "Yesterday" on day before current', () => {
    const shortDate = angularPipe.transform(
      yesterday.toString(),
      shortTransformFormat,
    );
    expect(pipe.transform(yesterday.toString())).toMatch(
      'Yesterday, ' + shortDate,
    );
  });

  it('Should not set "Yesterday" on different from yesterday days', () => {
    expect(pipe.transform(past.toString())).not.toMatch(/^(Yesterday)/);
    expect(pipe.transform(future.toString())).not.toMatch(/^(Yesterday)/);
    expect(pipe.transform(today.toString())).not.toMatch(/^(Yesterday)/);
  });

  it('Should pass past and future dates to Angular\'s DatePipe', () => {
    const pastString = past.toString();
    const futureString = past.toString();
    expect(pipe.transform(pastString)).toBe(
      angularPipe.transform(pastString, transformFormat),
    );
    expect(pipe.transform(futureString)).toBe(
      angularPipe.transform(futureString, transformFormat),
    );
  });
});
