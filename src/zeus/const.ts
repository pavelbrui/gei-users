/* eslint-disable */

export const AllTypesProps: Record<string,any> = {
	Query:{
		login:{
			user:"LoginInput"
		}
	},
	LoginInput:{

	},
	Mutation:{
		register:{
			user:"LoginInput"
		}
	}
}

export const ReturnTypes: Record<string,any> = {
	Query:{
		login:"String",
		isUser:"User",
		mustBeUser:"User"
	},
	Mutation:{
		register:"Boolean"
	},
	User:{
		username:"String"
	}
}

export const Ops = {
query: "Query" as const,
	mutation: "Mutation" as const
}