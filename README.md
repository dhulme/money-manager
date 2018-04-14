# Money Manager
Money Manager is a desktop application for managing your personal finances and accounts.

It uses [Electron](https://electron.atom.io/) as the application platform and [Vue.js](https://vuejs.org/) as the Front-End UI framework.

## Development Setup

Uses [Electron Webpack](https://webpack.electron.build/) package to manage build process, and [Electron Webpack Vue](https://github.com/stoufa88/electron-webpack-vue) as a Vue boilerplate.

``` bash
# install dependencies
npm install

# dev server with hot reload at localhost:8080
npm run dev

# compile source to webpack bundle
npm run build

# build packaged distribution with electron builder
npm run dist

# build unpackaged distribution with electron builder
npm run dist:dir
```

## Licence
MIT

## Data Structure
### Account
```javascript
{
  balance: String,
  category: String,
  id: String, // human readable
  name: String,
  transactionIds: [String...],
  type: String
}

```
### Transaction
```javascript
{
  date: String,
  description: String,
  expense: String, // account ID
  from: String, // account ID
  to: String, // account ID
  note: String,
  type: String,
  value: String
}
```

### Summary
```javascript
{
  balance: String
}
```

### Bulk Transaction
```javascript
{
  description: String,
  id: String, // human readable
  name: String,
  transactionIds: [String...]
}
```

### Bulk Transaction Transaction
```javascript
{
  from: String, // account ID
  to: String, // account ID
  note: String,
  value: String
}
```