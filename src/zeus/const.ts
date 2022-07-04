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
		login:"String"
	},
	Mutation:{
		register:"Boolean"
	}
}

export const Ops = {
query: "Query" as const,
	mutation: "Mutation" as const
}