import Mirage from 'ember-cli-mirage';

export default function() {
  this.get('/sign', { bucket: 'testbucket' });
  this.post('http://testbucket.s3.amazonaws.com', { message: 'OK' }, 201);
  this.post('/upload', { message: 'OK' }, 201);
  this.post('/invalid', { message: 'Not Found' }, 404);
}
