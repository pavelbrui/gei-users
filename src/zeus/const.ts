/* eslint-disable */

export const AllTypesProps: Record<string,any> = {
	Query:{
		login:{
			user:"LoginInput"
		},
		team:{

		},
		showTeamInvitations:{
			status:"InvitationTeamStatus"
		}
	},
	LoginInput:{
		loginType:"LoginType"
	},
	Mutation:{
		register:{
			userData:"RegisterInput"
		},
		verifyEmail:{
			verifyData:"VerifyEmailInput"
		},
		changePassword:{
			passwords:"ChangePasswordInput"
		},
		generateInviteToken:{
			tokenOptions:"InviteTokenInput"
		},
		removeUserFromTeam:{

		},
		sendInvitationToTeam:{
			invitation:"SendTeamInvitationInput"
		},
		joinToTeam:{

		},
		createTeam:{

		}
	},
	SendTeamInvitationInput:{

	},
	VerifyEmailInput:{

	},
	InviteTokenInput:{

	},
	ChangePasswordInput:{

	},
	RegisterInput:{

	},
	LoginType: "enum" as const,
	InvitationTeamStatus: "enum" as const
}

export const ReturnTypes: Record<string,any> = {
	Query:{
		login:"String",
		isUser:"User",
		mustBeUser:"User",
		team:"Team",
		showTeamInvitations:"String",
		getGoogleOAuthLink:"String"
	},
	Mutation:{
		register:"Boolean",
		verifyEmail:"Boolean",
		changePassword:"Boolean",
		generateInviteToken:"String",
		removeUserFromTeam:"Boolean",
		sendInvitationToTeam:"Boolean",
		joinToTeam:"Boolean",
		createTeam:"Boolean"
	},
	InviteToken:{
		token:"String",
		expires:"String",
		domain:"String",
		owner:"String"
	},
	Team:{
		name:"String",
		owner:"String",
		members:"String"
	},
	User:{
		username:"String",
		team:"String",
		emailConfirmed:"Boolean"
	}
}

export const Ops = {
query: "Query" as const,
	mutation: "Mutation" as const
}