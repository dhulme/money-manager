# Money Manager

Money Manager is a desktop application for managing your personal finances and accounts.

It uses [Electron](https://electron.atom.io/) as the application platform and [Vue.js](https://vuejs.org/) as the Front-End UI framework.

## Installation

Download the latest release [here](https://github.com/dhulme/money-manager/releases) and run the setup program. Currently on a Windows build is available.

## Screenshots

### Accounts

![Accounts](./docs/screenshots/accounts.png)

### Adding a Transaction

![Account](./docs/screenshots/account.png)

## Development Setup

Uses [Electron Vue]() to integrate Vue with Electron and handle build process.

```bash
# install dependencies
npm install

# dev server with hot reload at localhost:8080
npm run dev

# build packaged distribution with electron builder
npm run build

# build unpackaged distribution with electron builder
npm run build:dir
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
  type: String // one of 'asset', 'budget' or 'none',
  deleted: Boolean
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
  value: String,
  highlighted: Boolean
}
```

### Summary

```javascript
{
  balance: String;
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

## Settings

Money Manager settings are stored in your Windows user profile folder. Settings structure shown below.

```javascript
{
  projectPath: String;
}
```
