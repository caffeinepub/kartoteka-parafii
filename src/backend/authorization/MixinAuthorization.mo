import AccessControl "./access-control";

mixin (accessControlState : AccessControl.AccessControlState) {
  // Initialize auth — first caller becomes admin, subsequent unknown callers become users.
  // No token required.
  public shared ({ caller }) func _initializeAccessControlWithSecret(_ : Text) : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };
};
