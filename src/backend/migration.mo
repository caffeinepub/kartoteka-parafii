import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
  type ParentsData = {
    fullName : Text;
    age : Text;
    religion : Text;
    residence : Text;
  };

  type OldBaptismRecord = {
    id : Nat;
    actNumber : Text;
    baptismDate : Int;
    baptismPlace : Text;
    personFullName : Text;
    birthDate : Text;
    birthPlace : Text;
    father : ParentsData;
    mother : ParentsData;
    annotations : {
      confirmation : ?Text;
      marriage : ?Text;
      ordination : ?Text;
      profession : ?Text;
      generalNotes : ?Text;
    };
    createdAt : Int;
  };

  type NewBaptismRecord = {
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
    annotations : {
      confirmation : ?Text;
      marriage : ?Text;
      ordination : ?Text;
      profession : ?Text;
      generalNotes : ?Text;
    };
    createdAt : Int;
  };

  type OldActor = {
    baptismRegistry : Map.Map<Nat, OldBaptismRecord>;
    // Other fields remain unchanged and are not needed for migration
  };

  type NewActor = {
    baptismRegistry : Map.Map<Nat, NewBaptismRecord>;
    // Other fields remain unchanged and are not needed for migration
  };

  public func run(old : OldActor) : NewActor {
    let newBaptismRegistry = old.baptismRegistry.map<Nat, OldBaptismRecord, NewBaptismRecord>(
      func(_key, oldRecord) {
        {
          oldRecord with
          godfather = null;
          godmother = null;
        };
      }
    );
    { baptismRegistry = newBaptismRegistry };
  };
};
