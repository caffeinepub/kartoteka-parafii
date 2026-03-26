import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  public type UserRole = {
    #admin;
    #user;
    #guest;
  };

  public type AccessControlState = {
    var adminAssigned : Bool;
    userRoles : Map.Map<Principal, UserRole>;
  };

  public func initState() : AccessControlState {
    {
      var adminAssigned = false;
      userRoles = Map.empty<Principal, UserRole>();
    };
  };

  // First authenticated principal that calls this becomes admin.
  // Existing registered users are unchanged.
  // New users after admin is assigned are NOT auto-registered (must be added by admin).
  public func initialize(state : AccessControlState, caller : Principal) {
    if (caller.isAnonymous()) { return };
    switch (state.userRoles.get(caller)) {
      case (?_) {}; // already registered, nothing to do
      case (null) {
        if (not state.adminAssigned) {
          // First login ever — becomes admin
          state.userRoles.add(caller, #admin);
          state.adminAssigned := true;
        };
        // If admin already assigned and user not registered: do nothing
        // They will get false from isAuthorized and see Brak dostepu
        // until admin manually adds them
      };
    };
  };

  public func getUserRole(state : AccessControlState, caller : Principal) : UserRole {
    if (caller.isAnonymous()) { return #guest };
    switch (state.userRoles.get(caller)) {
      case (?role) { role };
      case (null) { #guest }; // unregistered = guest (no access, no trap)
    };
  };

  public func assignRole(state : AccessControlState, caller : Principal, user : Principal, role : UserRole) {
    if (not (isAdmin(state, caller))) {
      // Return silently if not admin rather than trapping
      return;
    };
    state.userRoles.add(user, role);
  };

  public func hasPermission(state : AccessControlState, caller : Principal, requiredRole : UserRole) : Bool {
    let userRole = getUserRole(state, caller);
    if (userRole == #admin or requiredRole == #guest) { true } else {
      userRole == requiredRole;
    };
  };

  public func isAdmin(state : AccessControlState, caller : Principal) : Bool {
    getUserRole(state, caller) == #admin;
  };
};
