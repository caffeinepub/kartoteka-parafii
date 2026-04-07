import Array "mo:core/Array";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import Storage "mo:caffeineai-object-storage/Storage";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";


 actor {
  include MixinObjectStorage();

  public type PaginatedResult<T> = {
    data : [T];
    totalCount : Nat;
    pageCount : Nat;
    currentPage : Nat;
    pageSize : Nat;
  };

  let pageSizeDefault = 20;
  let maxPageSize = 100;

  func getValidatedPageSize(requested : ?Nat) : Nat {
    switch (requested) {
      case (?size) {
        if (size > maxPageSize) { maxPageSize } else { if (size < 1) { 1 } else { size } };
      };
      case (null) { pageSizeDefault };
    };
  };

  func getValidatedPage(pageInput : ?Nat) : Nat {
    switch (pageInput) {
      case (?page) {
        if (page < 1) { 1 } else { page };
      };
      case (null) { 1 };
    };
  };

  func getPaginatedInternalArray<T>(sortedArray : [T], page : ?Nat, pageSize : ?Nat) : PaginatedResult<T> {
    let validPageSize = getValidatedPageSize(pageSize);
    let validPage = getValidatedPage(page);
    let totalCount = sortedArray.size();
    let pageCount = if (totalCount > 0) {
      let quotient = (totalCount + validPageSize - 1) / validPageSize;
      if (quotient == 0) { 1 } else { quotient };
    } else { 1 };

    let safeStartIndex = if ((validPage - 1) * validPageSize >= totalCount) { 0 } else {
      (validPage - 1) * validPageSize;
    };
    let startIndex = if (safeStartIndex > totalCount) {
      if (totalCount > 0) { totalCount - 1 } else { 0 };
    } else { safeStartIndex };

    let endIndex = Int.max(Int.abs(startIndex) + Int.abs(validPageSize - 1), 0);

    let dataSlice = sortedArray.sliceToArray(
      startIndex,
      Int.min(endIndex, Int.abs(totalCount)),
    );

    {
      data = dataSlice;
      totalCount;
      pageCount;
      currentPage = validPage;
      pageSize = validPageSize;
    };
  };

  func getPaginatedInternalIter<T>(iter : Iter.Iter<T>, page : ?Nat, pageSize : ?Nat) : PaginatedResult<T> {
    let sortedArray = iter.toArray();
    getPaginatedInternalArray(sortedArray, page, pageSize);
  };

  public type Sacraments = {
    birthYear : ?Nat;
    baptismYear : ?Nat;
    communionYear : ?Nat;
    confirmationYear : ?Nat;
    marriageYear : ?Nat;
    funeralYear : ?Nat;
  };

  public type FamilyMember = {
    name : Text;
    relationType : RelationType;
    sacraments : Sacraments;
  };

  public type RelationType = {
    #spouse;
    #child;
    #other;
  };

  public type Offer = {
    amount : Nat;
    year : Int;
    description : Text;
  };

  public type Parishioner = {
    firstName : Text;
    lastName : Text;
    birthYear : ?Nat;
    profession : ?Text;
    phone : ?Text;
    email : ?Text;
    address : ?Text;
    sacraments : Sacraments;
    family : [FamilyMember];
    offers : [Offer];
    pastoralNotes : ?Text;
    uid : Nat;
    photo : ?Storage.ExternalBlob;
  };

  public type Locality = {
    name : Text;
    contactPerson : Text;
    phone : Text;
    tasks : [Text];
  };

  public type LocalityResident = {
    name : Text;
    isFamilyMember : Bool;
    relationType : ?RelationType;
  };

  public type LocalityWithParishioners = {
    name : Text;
    contactPerson : Text;
    phone : Text;
    tasks : [Text];
    totalParishioners : Nat;
    residents : [LocalityResident];
  };

  public type TransactionType = {
    #income;
    #expense;
  };

  public type UniqueId = Nat;

  public type BudgetTransaction = {
    uid : UniqueId;
    type_ : TransactionType;
    amount : Nat;
    timestamp : Int;
    description : Text;
    category : Text;
    relatedParishioner : ?Nat;
    relatedLocality : ?Text;
  };

  public type Task = {
    description : Text;
    assignedParishioners : [Nat];
  };

  public type Event = {
    title : Text;
    timestamp : Int;
    description : Text;
    tasks : [Task];
    uid : UniqueId;
  };

  public type ParishFunctionAssignment = {
    title : Text;
    description : Text;
    assignedParishioner : Nat;
    address : Text;
    contacts : [Text];
    uid : UniqueId;
  };

  public type ParishFunctionLocalityAssignment = {
    localityName : Text;
    description : Text;
    assignedParishioners : [Nat];
    contacts : [Text];
    uid : UniqueId;
  };

  public type StatisticEntry = {
    sundayAttendance : Nat;
    communionCount : Nat;
    timestamp : Int;
  };

  public type ParishNote = {
    title : Text;
    timestamp : Int;
    content : Text;
  };

  public type UserProfile = {
    name : Text;
    role : Text;
  };

  public type SacramentYearCounts = {
    baptisms : Nat;
    communions : Nat;
    confirmations : Nat;
    marriages : Nat;
    funerals : Nat;
  };

  public type AnnualSacramentStats = {
    year : Nat;
    totals : SacramentYearCounts;
  };

  public type CollectiveOffering = {
    id : UniqueId;
    amount : Nat;
    year : Int;
    description : Text;
    locality : Text;
    timestamp : Int;
  };

  public type IndividualOffering = {
    id : UniqueId;
    amount : Nat;
    year : Int;
    description : Text;
    parishionerId : Nat;
    timestamp : Int;
  };

  public type Letter = {
    uid : Nat;
    title : Text;
    body : Text;
    date : Int;
    year : Nat;
    number : Nat;
    adresat : ?Text;
  };

  public type AnniversaryType = {
    #baptism;
    #marriage;
    #funeral;
  };

  public type Anniversary = {
    parishionerId : Nat;
    firstName : Text;
    lastName : Text;
    anniversaryType : AnniversaryType;
    eventYear : Nat;
    targetYear : Nat;
    anniversaryNumber : Nat;
    address : ?Text;
  };

  public type AnniversaryPdfExport = {
    year : Nat;
    anniversaries : [Anniversary];
  };

  public type GetAnniversariesRequest = {
    year : Nat;
    anniversaryType : ?AnniversaryType;
    page : ?Nat;
    pageSize : ?Nat;
  };

  public type GetAnniversariesPdfExportRequest = {
    year : Nat;
    anniversaryType : ?AnniversaryType;
  };

  public type ParentsData = {
    fullName : Text;
    age : Text;
    religion : Text;
    residence : Text;
  };

  public type BaptismAnnotations = {
    confirmation : ?Text;
    marriage : ?Text;
    ordination : ?Text;
    profession : ?Text;
    generalNotes : ?Text;
  };

  public type BaptismRecord = {
    id : Nat;
    actNumber : Text;
    baptismDate : Int;
    baptismPlace : Text;
    personFullName : Text;
    birthDate : Text;
    birthPlace : Text;
    father : ParentsData;
    mother : ParentsData;
    godfather : ?ParentsData;
    godmother : ?ParentsData;
    annotations : BaptismAnnotations;
    createdAt : Int;
  };

  public type BaptismRecordSortMode = {
    #newestFirst;
    #oldestFirst;
    #alphabetical;
  };

  public type GetBaptismRegistryRequest = {
    page : ?Nat;
    pageSize : ?Nat;
    search : ?Text;
    sortMode : ?BaptismRecordSortMode;
  };

  func compareLocalities(a : Locality, b : Locality) : Order.Order {
    a.name.compare(b.name);
  };

  func compareParishioners(a : Parishioner, b : Parishioner) : Order.Order {
    switch (a.lastName.compare(b.lastName)) {
      case (#equal) {
        a.firstName.compare(b.firstName);
      };
      case (other) { other };
    };
  };

  func compareBudgetTransactions(a : BudgetTransaction, b : BudgetTransaction) : Order.Order {
    Nat.compare(a.uid, b.uid);
  };

  func compareEventsByDate(a : Event, b : Event) : Order.Order {
    Nat.compare(Int.abs(a.timestamp), Int.abs(b.timestamp));
  };

  func compareParishFunctionAssignments(a : ParishFunctionAssignment, b : ParishFunctionAssignment) : Order.Order {
    Text.compare(a.title, b.title);
  };

  func compareParishFunctionLocalityAssignments(a : ParishFunctionLocalityAssignment, b : ParishFunctionLocalityAssignment) : Order.Order {
    Text.compare(a.localityName, b.localityName);
  };

  func compareStatisticEntries(a : StatisticEntry, b : StatisticEntry) : Order.Order {
    Nat.compare(Int.abs(a.timestamp), Int.abs(b.timestamp));
  };

  func compareParishNotes(a : ParishNote, b : ParishNote) : Order.Order {
    Nat.compare(Int.abs(a.timestamp), Int.abs(b.timestamp));
  };

  func compareAnniversariesForPdfExport(a : Anniversary, b : Anniversary) : Order.Order {
    switch (a.lastName.compare(b.lastName)) {
      case (#equal) { a.firstName.compare(b.firstName) };
      case (other) { other };
    };
  };

  stable var nextUniqueId = 0;

  stable var parishioners = Map.empty<Nat, Parishioner>();
  stable var localities = Map.empty<Text, Locality>();
  stable var budgetTransactions = Map.empty<UniqueId, BudgetTransaction>();
  stable var events = Map.empty<UniqueId, Event>();
  stable var parishFunctionAssignments = Map.empty<UniqueId, ParishFunctionAssignment>();
  stable var parishFunctionLocalityAssignments = Map.empty<UniqueId, ParishFunctionLocalityAssignment>();
  stable var statistics = Map.empty<UniqueId, StatisticEntry>();
  stable var parishNotes = Map.empty<UniqueId, ParishNote>();
  stable var userProfiles = Map.empty<Principal, UserProfile>();
  stable var collectiveOfferings = Map.empty<UniqueId, CollectiveOffering>();
  stable var individualOfferings = Map.empty<UniqueId, IndividualOffering>();
  stable var letters = Map.empty<Nat, Letter>();
  stable var nextLetterNumber = 1;

  stable var baptismRegistry = Map.empty<Nat, BaptismRecord>();

  // Stable backup for access control state (persists across upgrades)
  stable var _stableAdminAssigned : Bool = false;
  stable var _stableUserRoles = Map.empty<Principal, AccessControl.UserRole>();

  let accessControlState = AccessControl.initState();

  // Restore access control state after upgrade
  system func postupgrade() {
    accessControlState.adminAssigned := _stableAdminAssigned;
    for ((principal, role) in _stableUserRoles.entries()) {
      accessControlState.userRoles.add(principal, role);
    };
  };

  // Save access control state before upgrade
  system func preupgrade() {
    _stableAdminAssigned := accessControlState.adminAssigned;
    _stableUserRoles := Map.empty<Principal, AccessControl.UserRole>();
    for ((principal, role) in accessControlState.userRoles.entries()) {
      _stableUserRoles.add(principal, role);
    };
  };
  include MixinAuthorization(accessControlState);

  public query ({ caller }) func isAuthorized() : async Bool {
    if (caller.isAnonymous()) { return false };
    switch (accessControlState.userRoles.get(caller)) {
      case (?(#admin)) { true };
      case (?(#user)) { true };
      case (_) { false };
    };
  };

  public query ({ caller }) func getAnniversariesForYearPaginated(request : GetAnniversariesRequest) : async PaginatedResult<Anniversary> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can access anniversaries");
    };
    let result = getAnniversariesForYearInternal(request.year, request.anniversaryType);
    let sorted = result.values().toArray().sort(compareAnniversariesForPdfExport);
    getPaginatedInternalArray(sorted, request.page, request.pageSize);
  };

  public query (
    { caller }
  ) func getAnniversariesForYearPdfExport(request : GetAnniversariesPdfExportRequest) : async AnniversaryPdfExport {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can access anniversaries for PDF export");
    };

    let sortedAnniversaries = getAnniversariesForYearInternal(request.year, request.anniversaryType).toArray().sort(compareAnniversariesForPdfExport);

    {
      year = request.year;
      anniversaries = sortedAnniversaries;
    };
  };

  func getAnniversariesForYearInternal(year : Nat, anniversaryType : ?AnniversaryType) : List.List<Anniversary> {
    let anniversariesList = List.empty<Anniversary>();

    func createAndAdd(
      id : Nat,
      firstName : Text,
      lastName : Text,
      anniversaryType : AnniversaryType,
      eventYear : Nat,
      targetYear : Nat,
      anniversaryNumber : Nat,
      address : ?Text,
    ) {
      let anniversary : Anniversary = {
        parishionerId = id;
        firstName;
        lastName;
        anniversaryType;
        eventYear;
        targetYear;
        anniversaryNumber;
        address;
      };
      anniversariesList.add(anniversary);
    };

    let yearNat = year;

    for (parishioner in parishioners.values()) {
      // Baptism
      switch (parishioner.sacraments.baptismYear) {
        case (?baptismYear) {
          if (baptismYear < yearNat) {
            let shouldInclude = switch (anniversaryType) {
              case (null) { true };
              case (?#baptism) { true };
              case (_) { false };
            };
            if (shouldInclude) {
              createAndAdd(
                parishioner.uid,
                parishioner.firstName,
                parishioner.lastName,
                #baptism,
                baptismYear,
                yearNat,
                yearNat - baptismYear,
                parishioner.address,
              );
            };
          };
        };
        case (null) {};
      };

      // Marriage
      switch (parishioner.sacraments.marriageYear) {
        case (?marriageYear) {
          if (marriageYear < yearNat) {
            let shouldInclude = switch (anniversaryType) {
              case (null) { true };
              case (?#marriage) { true };
              case (_) { false };
            };
            if (shouldInclude) {
              createAndAdd(
                parishioner.uid,
                parishioner.firstName,
                parishioner.lastName,
                #marriage,
                marriageYear,
                yearNat,
                yearNat - marriageYear,
                parishioner.address,
              );
            };
          };
        };
        case (null) {};
      };

      // Funeral
      switch (parishioner.sacraments.funeralYear) {
        case (?funeralYear) {
          if (funeralYear < yearNat) {
            let shouldInclude = switch (anniversaryType) {
              case (null) { true };
              case (?#funeral) { true };
              case (_) { false };
            };
            if (shouldInclude) {
              createAndAdd(
                parishioner.uid,
                parishioner.firstName,
                parishioner.lastName,
                #funeral,
                funeralYear,
                yearNat,
                yearNat - funeralYear,
                parishioner.address,
              );
            };
          };
        };
        case (null) {};
      };
    };
    anniversariesList;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  func getPaginatedParishionersHelper(page : ?Nat, pageSize : ?Nat) : PaginatedResult<Parishioner> {
    let sortedParishioners = parishioners.values().toArray().sort(compareParishioners);
    getPaginatedInternalArray(sortedParishioners, page, pageSize);
  };

  public query ({ caller }) func getPaginatedParishioners(page : ?Nat, pageSize : ?Nat) : async PaginatedResult<Parishioner> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can access parishioners");
    };
    getPaginatedParishionersHelper(page, pageSize);
  };

  public shared ({ caller }) func addParishioner(_ : Parishioner) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can add parishioners");
    };
    Runtime.trap("AddParishioner is deprecated, use updateParishioner instead");
  };

  public shared ({ caller }) func updateParishioner(id : Nat, parishioner : Parishioner) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can update parishioners");
    };
    parishioners.add(id, { parishioner with uid = id });
  };

  public shared ({ caller }) func deleteParishioner(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can delete parishioners");
    };
    if (not parishioners.containsKey(id)) { Runtime.trap("Parishioner does not exist") };
    parishioners.remove(id);
  };

  public query ({ caller }) func hasParishioners() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can check parishioner status");
    };
    not parishioners.isEmpty();
  };

  func getPaginatedLocalitiesHelper(page : ?Nat, pageSize : ?Nat) : PaginatedResult<Locality> {
    let sortedLocalities = localities.values().toArray().sort(compareLocalities);
    getPaginatedInternalArray(sortedLocalities, page, pageSize);
  };

  public query ({ caller }) func getPaginatedLocalities(page : ?Nat, pageSize : ?Nat) : async PaginatedResult<Locality> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can access localities");
    };
    getPaginatedLocalitiesHelper(page, pageSize);
  };

  func getPaginatedLocalitiesWithParishionersHelper(page : ?Nat, pageSize : ?Nat) : PaginatedResult<LocalityWithParishioners> {
    let allParishioners = parishioners.values().toArray();
    let allLocalities = localities.values().toArray();

    let withResidents = allLocalities.map(
      func(locality) {
        let residentsList = List.empty<LocalityResident>();

        // Add parishioner residents
        for (parishioner in allParishioners.values()) {
          switch (parishioner.address) {
            case (?address) {
              if (address.contains(#text(locality.name))) {
                let parishionerResident : LocalityResident = {
                  name = parishioner.firstName # " " # parishioner.lastName;
                  isFamilyMember = false;
                  relationType = null;
                };
                residentsList.add(parishionerResident);
              };
            };
            case (null) {};
          };
        };

        // Add family member residents (only if associated with parishioner's address)
        for (parishioner in allParishioners.values()) {
          switch (parishioner.address) {
            case (?address) {
              if (address.contains(#text(locality.name))) {
                for (familyMember in parishioner.family.values()) {
                  let familyResident : LocalityResident = {
                    name = familyMember.name;
                    isFamilyMember = true;
                    relationType = ?familyMember.relationType;
                  };
                  residentsList.add(familyResident);
                };
              };
            };
            case (null) {};
          };
        };

        // Count only parishioners
        let totalParishioners = residentsList.values().toArray().filter(
          func(resident) { not resident.isFamilyMember }
        ).size();

        {
          locality with
          totalParishioners;
          residents = residentsList.toArray();
        };
      }
    );

    let sortedWithResidents = withResidents.sort(
      func(a, b) { Text.compare(a.name, b.name) }
    );

    getPaginatedInternalArray(sortedWithResidents, page, pageSize);
  };

  public query ({ caller }) func getPaginatedLocalitiesWithParishioners(page : ?Nat, pageSize : ?Nat) : async PaginatedResult<LocalityWithParishioners> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can access localities");
    };
    getPaginatedLocalitiesWithParishionersHelper(page, pageSize);
  };

  public shared ({ caller }) func addLocality(locality : Locality) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can add localities");
    };
    if (localities.containsKey(locality.name)) { Runtime.trap("Locality already exists") };
    localities.add(locality.name, locality);
  };

  public shared ({ caller }) func updateLocality(name : Text, locality : Locality) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can update localities");
    };
    if (not localities.containsKey(name)) { Runtime.trap("Locality does not exist") };
    localities.add(name, locality);
  };

  public shared ({ caller }) func deleteLocality(name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can delete localities");
    };
    if (not localities.containsKey(name)) { Runtime.trap("Locality does not exist") };
    localities.remove(name);
  };

  func getPaginatedBudgetTransactionsHelper(page : ?Nat, pageSize : ?Nat) : PaginatedResult<BudgetTransaction> {
    let sortedTransactions = budgetTransactions.values().toArray().sort(compareBudgetTransactions);
    getPaginatedInternalArray(sortedTransactions, page, pageSize);
  };

  public query ({ caller }) func getPaginatedBudgetTransactions(page : ?Nat, pageSize : ?Nat) : async PaginatedResult<BudgetTransaction> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can access budget transactions");
    };
    getPaginatedBudgetTransactionsHelper(page, pageSize);
  };

  func getPaginatedBudgetTransactionsByDateRangeHelper(startTimestamp : Int, endTimestamp : Int, page : ?Nat, pageSize : ?Nat) : PaginatedResult<BudgetTransaction> {
    let filtered = budgetTransactions.values().toArray().filter(
      func(transaction) {
        transaction.timestamp >= startTimestamp and transaction.timestamp <= endTimestamp
      }
    );

    let sortedFiltered = filtered.sort(compareBudgetTransactions);
    getPaginatedInternalArray(sortedFiltered, page, pageSize);
  };

  public query ({ caller }) func getPaginatedBudgetTransactionsByDateRange(page : ?Nat, pageSize : ?Nat, startTimestamp : Int, endTimestamp : Int) : async PaginatedResult<BudgetTransaction> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can access budget transactions");
    };
    getPaginatedBudgetTransactionsByDateRangeHelper(
      startTimestamp,
      endTimestamp,
      page,
      pageSize,
    );
  };

  public shared ({ caller }) func addBudgetTransaction(transaction : BudgetTransaction) : async UniqueId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can add budget transactions");
    };
    let uid = nextUniqueId;
    nextUniqueId += 1;
    let transactionWithUid = { transaction with uid };
    budgetTransactions.add(uid, transactionWithUid);
    uid;
  };

  public shared ({ caller }) func updateBudgetTransaction(uid : UniqueId, transaction : BudgetTransaction) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can update budget transactions");
    };
    if (not budgetTransactions.containsKey(uid)) { Runtime.trap("Transaction does not exist") };
    budgetTransactions.add(uid, transaction);
  };

  public shared ({ caller }) func deleteBudgetTransaction(uid : UniqueId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can delete budget transactions");
    };
    if (not budgetTransactions.containsKey(uid)) { Runtime.trap("Transaction does not exist") };
    budgetTransactions.remove(uid);
  };

  public query ({ caller }) func getPaginatedEvents(page : ?Nat, pageSize : ?Nat) : async PaginatedResult<Event> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can access events");
    };
    let sortedEvents = events.values().toArray().sort(compareEventsByDate);
    getPaginatedInternalArray(sortedEvents, page, pageSize);
  };

  public shared ({ caller }) func addEvent(_ : Event) : async UniqueId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can add events");
    };
    Runtime.trap("AddEvent is deprecated, use updateEvent instead");
  };

  public shared ({ caller }) func updateEvent(id : UniqueId, event : Event) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can update events");
    };
    events.add(id, { event with uid = id });
  };

  public shared ({ caller }) func deleteEvent(id : UniqueId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can delete events");
    };
    if (not events.containsKey(id)) { Runtime.trap("Event does not exist") };
    events.remove(id);
  };

  func getPaginatedParishFunctionAssignmentsHelper(page : ?Nat, pageSize : ?Nat) : PaginatedResult<ParishFunctionAssignment> {
    getPaginatedInternalIter(parishFunctionAssignments.values(), page, pageSize);
  };

  func getPaginatedParishFunctionLocalityAssignmentsHelper(page : ?Nat, pageSize : ?Nat) : PaginatedResult<ParishFunctionLocalityAssignment> {
    getPaginatedInternalIter(
      parishFunctionLocalityAssignments.values(),
      page,
      pageSize,
    );
  };

  public query ({ caller }) func getPaginatedParishFunctionAssignments(page : ?Nat, pageSize : ?Nat) : async PaginatedResult<ParishFunctionAssignment> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can access function assignments");
    };
    getPaginatedParishFunctionAssignmentsHelper(page, pageSize);
  };

  public query ({ caller }) func getPaginatedParishFunctionLocalityAssignments(page : ?Nat, pageSize : ?Nat) : async PaginatedResult<ParishFunctionLocalityAssignment> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can access function locality assignments");
    };
    getPaginatedParishFunctionLocalityAssignmentsHelper(page, pageSize);
  };

  public query ({ caller }) func getAllPaginatedParishFunctionData(page : ?Nat, pageSize : ?Nat) : async {
    assignments : PaginatedResult<ParishFunctionAssignment>;
    localityAssignments : PaginatedResult<ParishFunctionLocalityAssignment>;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can access full function data");
    };

    let assignments = getPaginatedParishFunctionAssignmentsHelper(page, pageSize);
    let localityAssignments = getPaginatedParishFunctionLocalityAssignmentsHelper(
      page,
      pageSize,
    );

    { assignments; localityAssignments };
  };

  public shared ({ caller }) func addParishFunctionAssignment(_ : ParishFunctionAssignment) : async UniqueId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can add parish function assignments");
    };
    Runtime.trap("AddParishFunctionAssignment is deprecated, use updateParishFunctionAssignment instead");
  };

  public shared ({ caller }) func updateParishFunctionAssignment(id : UniqueId, assignment : ParishFunctionAssignment) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can update parish function assignments");
    };
    parishFunctionAssignments.add(id, { assignment with uid = id });
  };

  public shared ({ caller }) func deleteParishFunctionAssignment(id : UniqueId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can delete parish function assignments");
    };
    if (not parishFunctionAssignments.containsKey(id)) { Runtime.trap("Assignment does not exist") };
    parishFunctionAssignments.remove(id);
  };

  public shared ({ caller }) func addParishFunctionLocalityAssignment(_ : ParishFunctionLocalityAssignment) : async UniqueId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can add parish function locality assignments");
    };
    Runtime.trap("AddParishFunctionLocalityAssignment is deprecated, use updateParishFunctionLocalityAssignment instead");
  };

  public shared ({ caller }) func updateParishFunctionLocalityAssignment(id : UniqueId, assignment : ParishFunctionLocalityAssignment) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can update parish function locality assignments");
    };
    parishFunctionLocalityAssignments.add(id, { assignment with uid = id });
  };

  public shared ({ caller }) func deleteParishFunctionLocalityAssignment(id : UniqueId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can delete parish function locality assignments");
    };
    if (not parishFunctionLocalityAssignments.containsKey(id)) { Runtime.trap("Assignment does not exist") };
    parishFunctionLocalityAssignments.remove(id);
  };

  public query ({ caller }) func getPaginatedCollectiveOfferings(page : ?Nat, pageSize : ?Nat) : async PaginatedResult<CollectiveOffering> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can view collective offerings");
    };

    let sortedArray = collectiveOfferings.values().toArray();
    getPaginatedInternalArray(sortedArray, page, pageSize);
  };

  public query ({ caller }) func getPaginatedIndividualOfferings(page : ?Nat, pageSize : ?Nat) : async PaginatedResult<IndividualOffering> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can view individual offerings");
    };

    let sortedArray = individualOfferings.values().toArray();
    getPaginatedInternalArray(sortedArray, page, pageSize);
  };

  func getPaginatedParishNotesHelper(page : ?Nat, pageSize : ?Nat) : PaginatedResult<ParishNote> {
    let sortedNotes = parishNotes.values().toArray().sort(compareParishNotes);
    getPaginatedInternalArray(sortedNotes, page, pageSize);
  };

  public query ({ caller }) func getPaginatedParishNotes(page : ?Nat, pageSize : ?Nat) : async PaginatedResult<ParishNote> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can view parish notes");
    };
    getPaginatedParishNotesHelper(page, pageSize);
  };

  public shared ({ caller }) func addParishNote(_ : ParishNote) : async UniqueId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can add parish notes");
    };
    Runtime.trap("AddParishNote is deprecated, use updateParishNote instead");
  };

  public shared ({ caller }) func updateParishNote(id : UniqueId, note : ParishNote) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can update parish notes");
    };
    parishNotes.add(id, note);
  };

  public shared ({ caller }) func deleteParishNote(id : UniqueId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can delete parish notes");
    };
    if (not parishNotes.containsKey(id)) { Runtime.trap("Note does not exist") };
    parishNotes.remove(id);
  };

  func getPaginatedStatisticEntriesHelper(page : ?Nat, pageSize : ?Nat) : PaginatedResult<StatisticEntry> {
    let sortedEntries = statistics.values().toArray().sort(compareStatisticEntries);
    getPaginatedInternalArray(sortedEntries, page, pageSize);
  };

  public query ({ caller }) func getPaginatedStatisticEntries(page : ?Nat, pageSize : ?Nat) : async PaginatedResult<StatisticEntry> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can view statistics");
    };
    getPaginatedStatisticEntriesHelper(page, pageSize);
  };

  public shared ({ caller }) func addStatisticEntry(_ : StatisticEntry) : async UniqueId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can add statistic entries");
    };
    Runtime.trap("AddStatisticEntry is deprecated, use updateStatisticEntry instead");
  };

  public shared ({ caller }) func updateStatisticEntry(id : UniqueId, entry : StatisticEntry) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can update statistic entries");
    };
    statistics.add(id, entry);
  };

  public shared ({ caller }) func deleteStatisticEntry(id : UniqueId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can delete statistic entries");
    };
    if (not statistics.containsKey(id)) { Runtime.trap("Statistic entry does not exist") };
    statistics.remove(id);
  };

  public shared ({ caller }) func addCollectiveOffering(offering : CollectiveOffering) : async UniqueId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can add collective offerings");
    };

    let id = nextUniqueId;
    nextUniqueId += 1;

    let newOffering = { offering with id };
    collectiveOfferings.add(id, newOffering);

    let budgetTransaction : BudgetTransaction = {
      uid = id;
      type_ = #income;
      amount = newOffering.amount;
      timestamp = newOffering.timestamp;
      description = newOffering.description;
      category = "Ofiary zbiorowe";
      relatedParishioner = null;
      relatedLocality = ?newOffering.locality;
    };

    budgetTransactions.add(id, budgetTransaction);
    id;
  };

  public query ({ caller }) func getAllCollectiveOfferings() : async [CollectiveOffering] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can view collective offerings");
    };
    collectiveOfferings.values().toArray();
  };

  public query ({ caller }) func getCollectiveOffering(id : UniqueId) : async ?CollectiveOffering {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can view collective offerings");
    };
    collectiveOfferings.get(id);
  };

  public shared ({ caller }) func updateCollectiveOffering(id : UniqueId, offering : CollectiveOffering) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can edit collective offerings");
    };
    if (not collectiveOfferings.containsKey(id)) {
      Runtime.trap("Offering does not exist");
    };

    let updatedOffering = { offering with id };
    collectiveOfferings.add(id, updatedOffering);

    let updatedTransaction : BudgetTransaction = {
      uid = id;
      type_ = #income;
      amount = updatedOffering.amount;
      timestamp = updatedOffering.timestamp;
      description = updatedOffering.description;
      category = "Ofiary zbiorowe";
      relatedParishioner = null;
      relatedLocality = ?updatedOffering.locality;
    };

    budgetTransactions.add(id, updatedTransaction);
  };

  public shared ({ caller }) func deleteCollectiveOffering(id : UniqueId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can delete collective offerings");
    };
    if (not collectiveOfferings.containsKey(id)) {
      Runtime.trap("Offering does not exist");
    };

    collectiveOfferings.remove(id);
    budgetTransactions.remove(id);
  };

  public query ({ caller }) func getCollectiveOfferingsByLocality(locality : Text) : async [CollectiveOffering] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can view collective offerings");
    };

    collectiveOfferings.values().toArray().filter(
      func(o) { o.locality == locality }
    );
  };

  public shared ({ caller }) func addIndividualOffering(offering : IndividualOffering) : async UniqueId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can add individual offerings");
    };

    let id = nextUniqueId;
    nextUniqueId += 1;

    let newOffering = { offering with id };
    individualOfferings.add(id, newOffering);

    let budgetTransaction : BudgetTransaction = {
      uid = id;
      type_ = #income;
      amount = newOffering.amount;
      timestamp = newOffering.timestamp;
      description = newOffering.description;
      category = "Ofiary indywidualne";
      relatedParishioner = ?newOffering.parishionerId;
      relatedLocality = null;
    };

    budgetTransactions.add(id, budgetTransaction);
    id;
  };

  public query ({ caller }) func getAllIndividualOfferings() : async [IndividualOffering] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can view individual offerings");
    };
    individualOfferings.values().toArray();
  };

  public query ({ caller }) func getIndividualOfferingsByParishioner(parishionerId : Nat) : async [IndividualOffering] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can view individual offerings");
    };

    individualOfferings.values().toArray().filter(
      func(o) { o.parishionerId == parishionerId }
    );
  };

  public query ({ caller }) func getIndividualOffering(id : UniqueId) : async ?IndividualOffering {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can view individual offerings");
    };
    individualOfferings.get(id);
  };

  public shared ({ caller }) func updateIndividualOffering(id : UniqueId, offering : IndividualOffering) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can edit individual offerings");
    };
    if (not individualOfferings.containsKey(id)) {
      Runtime.trap("Offering does not exist");
    };

    let updatedOffering = { offering with id };
    individualOfferings.add(id, updatedOffering);

    let updatedTransaction : BudgetTransaction = {
      uid = id;
      type_ = #income;
      amount = updatedOffering.amount;
      timestamp = updatedOffering.timestamp;
      description = updatedOffering.description;
      category = "Ofiary indywidualne";
      relatedParishioner = ?updatedOffering.parishionerId;
      relatedLocality = null;
    };

    budgetTransactions.add(id, updatedTransaction);
  };

  public shared ({ caller }) func deleteIndividualOffering(id : UniqueId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can delete individual offerings");
    };
    if (not individualOfferings.containsKey(id)) {
      Runtime.trap("Offering does not exist");
    };

    individualOfferings.remove(id);
    budgetTransactions.remove(id);
  };

  public query ({ caller }) func getAllResidents() : async [LocalityResident] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can view residents");
    };

    let residentsList = List.empty<LocalityResident>();

    for (parishioner in parishioners.values()) {
      let parishionerResident : LocalityResident = {
        name = parishioner.firstName # " " # parishioner.lastName;
        isFamilyMember = false;
        relationType = null;
      };
      residentsList.add(parishionerResident);

      for (familyMember in parishioner.family.values()) {
        let familyResident : LocalityResident = {
          name = familyMember.name;
          isFamilyMember = true;
          relationType = ?familyMember.relationType;
        };
        residentsList.add(familyResident);
      };
    };

    residentsList.toArray();
  };

  public query ({ caller }) func getResidentsByLocality(localityName : Text) : async [LocalityResident] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can view residents");
    };

    let residentsList = List.empty<LocalityResident>();

    for (parishioner in parishioners.values()) {
      switch (parishioner.address) {
        case (?address) {
          if (address.contains(#text(localityName))) {
            let parishionerResident : LocalityResident = {
              name = parishioner.firstName # " " # parishioner.lastName;
              isFamilyMember = false;
              relationType = null;
            };
            residentsList.add(parishionerResident);

            for (familyMember in parishioner.family.values()) {
              let familyResident : LocalityResident = {
                name = familyMember.name;
                isFamilyMember = true;
                relationType = ?familyMember.relationType;
              };
              residentsList.add(familyResident);
            };
          };
        };
        case (null) {};
      };
    };

    residentsList.toArray();
  };

  public query ({ caller }) func getTotalResidentCount() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can view resident count");
    };

    var count = 0;
    for (parishioner in parishioners.values()) {
      count += 1;
      count += parishioner.family.size();
    };
    count;
  };

  public query ({ caller }) func getResidentCountByLocality(localityName : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can view resident count");
    };

    var count = 0;
    for (parishioner in parishioners.values()) {
      switch (parishioner.address) {
        case (?address) {
          if (address.contains(#text(localityName))) {
            count += 1;
            count += parishioner.family.size();
          };
        };
        case (null) {};
      };
    };
    count;
  };

  public query ({ caller }) func getOverallBudgetBalance() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can view budget balance");
    };

    let transactionsArray = budgetTransactions.values().toArray();

    var totalIncome : Nat = 0;
    var totalExpenses : Nat = 0;

    for (transaction in transactionsArray.values()) {
      switch (transaction.type_) {
        case (#income) {
          totalIncome += transaction.amount;
        };
        case (#expense) {
          totalExpenses += transaction.amount;
        };
      };
    };

    if (totalIncome > totalExpenses) { totalIncome - totalExpenses } else {
      totalExpenses - totalIncome;
    };
  };

  public shared ({ caller }) func addLetter(title : Text, body : Text, year : Nat, adresat : ?Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can add letters");
    };

    let uid = nextUniqueId;
    nextUniqueId += 1;

    nextLetterNumber += 1;

    let letter : Letter = {
      uid;
      title;
      body;
      date = 0;
      year;
      number = nextLetterNumber - 1;
      adresat;
    };

    letters.add(uid, letter);

    uid;
  };

  public shared ({ caller }) func updateLetter(uid : Nat, title : Text, body : Text, adresat : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can update letters");
    };
    switch (letters.get(uid)) {
      case (null) { Runtime.trap("Letter does not exist") };
      case (?existingLetter) {
        let updatedLetter = {
          existingLetter with
          title;
          body;
          adresat;
        };
        letters.add(uid, updatedLetter);
      };
    };
  };

  public query ({ caller }) func getLetter(uid : Nat) : async ?Letter {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can get letters");
    };
    letters.get(uid);
  };

  public query ({ caller }) func getAllLetters() : async [Letter] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can get letters");
    };
    letters.values().toArray();
  };

  public shared ({ caller }) func deleteLetter(uid : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can delete letters");
    };

    if (letters.containsKey(uid)) {
      letters.remove(uid);
      return;
    };

    Runtime.trap("Letter does not exist");
  };

  // Baptism registry endpoints
  func compareBaptismRecordsByDateDescending(a : BaptismRecord, b : BaptismRecord) : Order.Order {
    Int.compare(b.baptismDate, a.baptismDate);
  };

  func compareBaptismRecordsByDateAscending(a : BaptismRecord, b : BaptismRecord) : Order.Order {
    Int.compare(a.baptismDate, b.baptismDate);
  };

  func compareBaptismRecordsByName(a : BaptismRecord, b : BaptismRecord) : Order.Order {
    a.personFullName.compare(b.personFullName);
  };

  public shared ({ caller }) func createBaptismRecord(record : BaptismRecord) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can create baptism registry entries");
    };
    let id = nextUniqueId;
    nextUniqueId += 1;
    let recordWithId = { record with id };
    baptismRegistry.add(id, recordWithId);
    id;
  };

  public query ({ caller }) func getBaptismRecord(id : Nat) : async ?BaptismRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can access baptism registry entries");
    };
    baptismRegistry.get(id);
  };

  public shared ({ caller }) func updateBaptismRecord(id : Nat, record : BaptismRecord) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can update baptism registry entries");
    };
    if (not baptismRegistry.containsKey(id)) {
      Runtime.trap("Record does not exist");
    };
    let updatedRecord = { record with id };
    baptismRegistry.add(id, updatedRecord);
  };

  public shared ({ caller }) func deleteBaptismRecord(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can delete baptism registry entries");
    };
    if (not baptismRegistry.containsKey(id)) {
      Runtime.trap("Record does not exist");
    };
    baptismRegistry.remove(id);
  };

  public query ({ caller }) func getBaptismRegistry(request : GetBaptismRegistryRequest) : async PaginatedResult<BaptismRecord> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can access baptism registry");
    };

    var recordsArray = baptismRegistry.values().toArray();

    switch (request.search) {
      case (?searchTerm) {
        let updatedSearchTerm = searchTerm.toLower();
        recordsArray := recordsArray.filter(
          func(record) { record.personFullName.toLower().contains(#text updatedSearchTerm) }
        );
      };
      case (null) {};
    };

    switch (request.sortMode) {
      case (?sortMode) {
        recordsArray := switch (sortMode) {
          case (#newestFirst) {
            recordsArray.sort(compareBaptismRecordsByDateDescending);
          };
          case (#oldestFirst) {
            recordsArray.sort(compareBaptismRecordsByDateAscending);
          };
          case (#alphabetical) {
            recordsArray.sort(compareBaptismRecordsByName);
          };
        };
      };
      case (null) {};
    };

    getPaginatedInternalArray(recordsArray, request.page, request.pageSize);
  };

  public shared ({ caller }) func clearBaptismRegistry() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authorized users can clear baptism registry");
    };
    baptismRegistry.clear();
  };
};
