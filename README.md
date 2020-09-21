# Ember Uploader [![Build Status](https://travis-ci.org/benefitcloud/ember-uploader.svg?branch=master)](https://travis-ci.org/benefitcloud/ember-uploader) [![Ember Observer Score](https://emberobserver.com/badges/ember-uploader.svg)](https://emberobserver.com/addons/ember-uploader)

An Ember.js file uploader that works with any browser that supports
[FormData](http://caniuse.com/#search=FormData).

## Getting Started

Ember Uploader is a Ember CLI compatible addon and can be installed as such.

```
ember install ember-uploader
```

#### Basic Setup
Create a new component called `file-upload` and extend `EmberUploader.FileField` provided by
ember-uploader. If you're using `EmberUploader.FileField`, it will
automatically give you an input field, and will set `files` property when you
choose a file.

```js
import FileField from 'ember-uploader/components/file-field';
import Uploader from 'ember-uploader/uploaders/uploader';

export default FileField.extend({
  filesDidChange(files) {
    const uploader = Uploader.create({
      url: this.get('url')
    });

    if (!Ember.isEmpty(files)) {
      // this second argument is optional and can to be sent as extra data with the upload
      uploader.upload(files[0], { whateverObject });
    }
  }
});
```

Call the component, pass it the url, and thats it!
```hbs
{{file-upload url="/upload"}}
```

#### Ajax Request Method
By default, the request will be sent as `POST`. To override that, set `method` when
creating the object:

```js
import Uploader from 'ember-uploader/uploaders/uploader';

const uploader = Uploader.create({
  url: '/upload',
  method: 'PUT'
});
```

#### Change Namespace

```js
import Uploader from 'ember-uploader/uploaders/uploader';

const uploader = Uploader.create({
  paramNamespace: 'post'
});

// will be sent as -> post[file]=...
```

#### Change Parameters
By default parameter will be `file`

```js
import Uploader from 'ember-uploader/uploaders/uploader';

const upload = Uploader.create({
  paramName: 'upload'
});

// will be sent as -> upload=...
```

#### Progress

```js
uploader.on('progress', e => {
  // Handle progress changes
  // Use `e.percent` to get percentage
});
```

#### Finished Uploading

```js
uploader.on('didUpload', e => {
  // Handle finished upload
});
```

```js
uploader.on('didUpload.withHeaders', e => {
  // Handle finished upload
});
```

#### Failed Uploading

```js
uploader.on('didError', (jqXHR, textStatus, errorThrown) => {
  // Handle unsuccessful upload
});
```

#### Response
Returned value from uploader will be a promise

```js
uploader.upload(file).then(data => {
  // Handle success
}, error => {
  // Handle failure
})
```

#### Multiple files
```js
import FileField from 'ember-uploader/components/file-field';
import Uploader from 'ember-uploader/uploaders/uploader';

export default FileField.extend({
  multiple: true,
  url: 'http://example.com/upload',

  filesDidChange(files) {
    const uploader = Uploader.create({
      url: this.get('url')
    });

    if (!Ember.isEmpty(files)) {
      // this second argument is optional and can to be sent as extra data with the upload
      uploader.upload(files, { whatheverObject });
    }
  }
});
```

### Modifying the request
Ember Uploader uses jQuery.ajax under the hood so it accepts the same
ajax settings via the `ajaxSettings` property which is then merged with any
settings required by Ember Uploader. Here we modify the headers sent with
the request. Note - S3 Uploader uses `signingAjaxSettings` as the relevant key.

```js
import Uploader from 'ember-uploader/uploaders/uploader';

export default Uploader.extend({
  ajaxSettings: {
    headers: {
      'X-Application-Name': 'Uploader Test'
    }
  }
});
```

#### Uploading to S3

Uploading to S3 works in similar manner to the default uploader. There is only
one extra step required before uploading.

You'll need to setup your backend to be able to sign the upload request, to be
able to make an authenticated request to S3. This step is required to avoid
saving secret token on your client.

```js
import FileField from 'ember-uploader/components/file-field';
import S3Uploader from 'ember-uploader/uploaders/s3';

export default FileField.extend({
  signingUrl: '',

  filesDidChange(files) {
    const uploader = S3Uploader.create({
      signingUrl: this.get('signingUrl'),
      signingAjaxSettings: {
        headers: {
          'X-Application-Name': 'Uploader Test'
        }
      }
    });

    uploader.on('didUpload', response => {
      // S3 will return XML with url
      let uploadedUrl = $(response).find('Location')[0].textContent;
      // http://yourbucket.s3.amazonaws.com/file.png
      uploadedUrl = decodeURIComponent(uploadedUrl);
    });

    if (!Ember.isEmpty(files)) {
      // Send a sign request then upload to S3
      // this second argument is optional and can to be sent as extra data with the upload
      uploader.upload(files[0], { whatheverObject });
    }
  }
});

```

For learning how to setup the backend, check the
[wiki](https://github.com/benefitcloud/ember-uploader/wiki/S3-Server-Setup)

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding
style. Add unit tests for any new or changed functionality.

Ember Uploader uses [node.js](http://nodejs.org) and
[Ember CLI](https://ember-cli.com/) for builds and tests. You will need to have
these tools installed if you would like to build Ember Uploader.

```sh
$ npm install -g ember-cli
```

To get started with development simply do a `yarn install` inside the cloned
repository to install all dependencies needed for running
[Ember CLI](http://www.ember-cli.com/).

Lint and test your code using: `ember test`.

## Thank you
The Ember team, its contributors and community for being awesome. Also thank
you to [Erik Bryn](http://twitter.com/ebryn) and the contributors behind
[ember-model](http://github.com/ebryn/ember-model) as well as
[TJ Holowaychuk](http://twitter.com/tjholowaychuk) for
[component/upload](http://github.com/component/upload).

## License
Copyright (c) 2014 Joshua Borton
Licensed under the MIT license.
