+++
date = "2017-09-06T08:52:50+02:00"
title = "Dealing with the BrowserStack Parallel Test Limit When Using TestCafe"
description = "Overcome the BrowserStack parallel test limit when using TestCafe. Run TestCafe tests consecutively on BrowserStack."
intro = "One problem you might run into, if you're trying to run cross browser tests in multiple browsers on BrowserStack with TestCafe, is the parallel test limit which depends on your BrowserStack plan. At the time of writing this, all regular BrowserStack plans include only one parallel test – which means that you're allowed to run only one automated test at a time..."
draft = false
categories = ["Development"]
tags = ["TDD", "Front-End testing", "acceptance tests"]
+++

In my previous article about [automated testing with TestCafe and BrowserStack](/blog/front-end-testing-cross-browser-acceptance-tests-with-testcafe-browserstack-and-npm-scripts/), we explored how to utilize TestCafe to run cross browser acceptance tests powered by BrowserStack.

One problem you might run into, if you're trying to run cross browser tests in multiple browsers on BrowserStack with TestCafe, is the parallel test limit which depends on your BrowserStack plan. At the time of writing this, all regular BrowserStack plans include only one parallel test – which means that you're allowed to run only one automated test at a time.

## TestCafe multi browser handling
The way I want to use TestCafe is to run automated tests on a wide range of browsers – all the browsers I want to actively support – to guarantee everything works as expected.

```bash
testcafe 'browserstack:ie@10.0:Windows 8,browserstack:ie@11.0:Windows 10,browserstack:edge@15.0:Windows 10,browserstack:edge@14.0:Windows 10,browserstack:firefox@54.0:Windows 10,browserstack:firefox@55.0:Windows 10,browserstack:chrome@59.0:Windows 10,browserstack:chrome@60.0:Windows 10,browserstack:opera@46.0:Windows 10,browserstack:opera@47.0:Windows 10,browserstack:safari@9.1:OS X El Capitan,browserstack:safari@10.1:OS X Sierra' test/acceptance/ --app 'http-server demo/ -p 1337 -s'
```

What you can see above is the usual way of how to start a TestCafe test with a list of all the browsers you want to test in. The problem with this approach is, that TestCafe want's to save you time and starts all the tests in all the browsers in parallel and it expects all the browsers to be connected. As we've learned before, regular BrowserStack plans only support to run one automated test in parallel. So if you're not on a super fancy 1,200 $ / month plan which does support running 12 automated tests in parallel, you end up with an error message like the following.

```bash
ERROR Unable to establish one or more of the specified browser connections. This can be caused by network issues or remote device failure.
```

Also your BrowserStack Automate instance will crash and you can't execute automated tests anymore. Even clicking “Stop session” on frozen tests won't work and you have to wait until they time out or some nice member of the BrowserStack support team stops them for you.

## Running TestCafe tests on BrowserStack consecutively
The solution to the problem is to run TestCafe tests on BrowserStack one after another instead of all at once. TestCafe does not support this out of the box so we have to build a little shell script to help us out.

```bash
#!/bin/bash

browsers=( "browserstack:ie@10.0:Windows 8" "browserstack:ie@11.0:Windows 10" "browserstack:edge@15.0:Windows 10" "browserstack:edge@14.0:Windows 10" "browserstack:firefox@54.0:Windows 10" "browserstack:firefox@55.0:Windows 10" "browserstack:chrome@59.0:Windows 10" "browserstack:chrome@60.0:Windows 10" "browserstack:opera@46.0:Windows 10" "browserstack:opera@47.0:Windows 10" "browserstack:safari@9.1:OS X El Capitan" "browserstack:safari@10.1:OS X Sierra" )

for i in "${browsers[@]}"
do
  ./node_modules/.bin/testcafe "${i}" test/acceptance/ --app 'http-server demo/ -p 1337 -s'
done
```

In the shell script above you can see an array of browsers in which we want to test in. In the `for` loop we're starting a new TestCafe test for each browser in the list. The tests run sequentially, only after one test is finished, the next one is started.

In this script I'm assuming your plan is limited to one parallel test at a time, if you're lucky enough to have a plan with a higher limit, you can group multiple browsers in the `browsers` array.

```bash
browsers=( "browserstack:ie@10.0:Windows 8,browserstack:ie@11.0:Windows 10,browserstack:edge@15.0:Windows 10" "browserstack:edge@14.0:Windows 10,browserstack:firefox@54.0:Windows 10,browserstack:firefox@55.0:Windows 10" "browserstack:chrome@59.0:Windows 10,browserstack:chrome@60.0:Windows 10,browserstack:opera@46.0:Windows 10" "browserstack:opera@47.0:Windows 10,browserstack:safari@9.1:OS X El Capitan,browserstack:safari@10.1:OS X Sierra" )
```

As you can see above you can group browsers to run in parallel by separating them with a comma. So in the following case `"browserstack:ie@10.0:Windows 8,browserstack:ie@11.0:Windows 10,browserstack:edge@15.0:Windows 10"` tests with Internet Explorer 10 and 11 and Edge 15 are started simultaneously. In this case you'd need a BrowserStack plan which supports running three automated tests in parallel.
