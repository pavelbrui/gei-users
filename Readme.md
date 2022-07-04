# GraphQL Editor Integration - Users

This integration allows basic username/password authentication with mongodb as a database

## How to use in GraphQL Editor

1. Select `Type` and `field` in stucco config
2. Select `From integration`
3. Select `gei-users/Query.login` for login or `gei-users/Mutation.register` for registration

## How to use in code

```sh
$ npm i gei-users
```

Add this to your `stucco.json` file

```json
{
  "resolvers": {
    "<Type>.<fieldName>": {
      "resolve": {
        "name": "node_modules/gei-users/lib/Query/login"
      }
    },
    "<Type>.<fieldName>": {
      "resolve": {
        "name": "node_modules/gei-users/lib/Mutation/register"
      }
    }
  }
}
```

where `Type` and `fieldName` are defined for your schema, for example:

```json
{
  "resolvers": {
    "Query.login": {
      "resolve": {
        "name": "node_modules/gei-users/lib/Query/login"
      }
    },
    "Mutation.register": {
      "resolve": {
        "name": "node_modules/gei-users/lib/Mutation/register"
      }
    }
  }
}
```

They need to implement the SDL type parameters.
