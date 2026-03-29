import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Anniversary,
  AnniversaryPdfExport,
  AnniversaryType,
  BaptismRecord,
  BudgetTransaction,
  CollectiveOffering,
  Event,
  GetAnniversariesPdfExportRequest,
  GetAnniversariesRequest,
  IndividualOffering,
  Letter,
  Locality,
  LocalityWithParishioners,
  PaginatedResult,
  PaginatedResult_1,
  PaginatedResult_2,
  PaginatedResult_3,
  PaginatedResult_4,
  PaginatedResult_5,
  PaginatedResult_6,
  PaginatedResult_7,
  PaginatedResult_8,
  PaginatedResult_9,
  PaginatedResult_10,
  PaginatedResult_11,
  ParishFunctionAssignment,
  ParishFunctionLocalityAssignment,
  ParishNote,
  Parishioner,
  StatisticEntry,
  UniqueId,
  UserProfile,
} from "../backend";
import type { BaptismRecordSortMode } from "../backend";
import { useActor } from "./useActor";

// Helper types to include IDs with data
export type EventWithId = { id: UniqueId; data: Event };
export type ParishNoteWithId = { id: UniqueId; data: ParishNote };
export type ParishFunctionAssignmentWithId = {
  id: UniqueId;
  data: ParishFunctionAssignment;
};
export type ParishFunctionLocalityAssignmentWithId = {
  id: UniqueId;
  data: ParishFunctionLocalityAssignment;
};
export type StatisticEntryWithId = { id: UniqueId; data: StatisticEntry };

// User Profile
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: 3,
    retryDelay: 1000,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useIsAuthorized() {
  const { actor, isFetching: actorFetching } = useActor();

  // Use getCallerUserRole() which exists on the deployed canister.
  // actor.isAuthorized() does NOT exist on the canister DID — calling it throws.
  // A caller is authorized if their role is admin or user (not guest).
  // #guest is returned for anonymous callers or principals not yet registered.
  const query = useQuery<boolean>({
    queryKey: ["isAuthorized"],
    queryFn: async () => {
      if (!actor) return false;
      try {
        const role = await actor.getCallerUserRole();
        // Motoko variant arrives as { admin: null } | { user: null } | { guest: null }
        if (typeof role === "object" && role !== null) {
          return "admin" in role || "user" in role;
        }
        // Fallback: string form "admin" | "user" | "guest"
        return role === "admin" || role === "user";
      } catch (e) {
        console.warn("useIsAuthorized: getCallerUserRole failed", e);
        return false;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
    retryDelay: 1500,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isAuthorized: query.data === true,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

// Parishioners - Paginated
export function useGetPaginatedParishioners(page = 1, pageSize = 20) {
  const { actor, isFetching } = useActor();

  return useQuery<PaginatedResult_1>({
    queryKey: ["parishioners", "paginated", page, pageSize],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getPaginatedParishioners(BigInt(page), BigInt(pageSize));
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    gcTime: 300000,
  });
}

// Parishioners - All (for Dashboard and Statistics) - Optimized with stale-while-revalidate
export function useGetAllParishioners() {
  const { actor, isFetching } = useActor();

  return useQuery<Parishioner[]>({
    queryKey: ["parishioners", "all"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getPaginatedParishioners(
        BigInt(1),
        BigInt(1000),
      );
      return result.data;
    },
    enabled: !!actor && !isFetching,
    staleTime: 60000,
    gcTime: 300000,
    placeholderData: [],
  });
}

export function useUpdateParishioner() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      parishioner,
    }: { id: bigint; parishioner: Parishioner }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateParishioner(id, parishioner);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parishioners"] });
      queryClient.invalidateQueries({ queryKey: ["localities"] });
      queryClient.invalidateQueries({
        queryKey: ["localitiesWithParishioners"],
      });
      queryClient.invalidateQueries({ queryKey: ["budgetTransactions"] });
      queryClient.invalidateQueries({ queryKey: ["individualOfferings"] });
      queryClient.invalidateQueries({ queryKey: ["budgetBalance"] });
      queryClient.invalidateQueries({ queryKey: ["anniversaries"] });
    },
  });
}

export function useDeleteParishioner() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteParishioner(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parishioners"] });
      queryClient.invalidateQueries({ queryKey: ["localities"] });
      queryClient.invalidateQueries({
        queryKey: ["localitiesWithParishioners"],
      });
      queryClient.invalidateQueries({ queryKey: ["budgetTransactions"] });
      queryClient.invalidateQueries({ queryKey: ["individualOfferings"] });
      queryClient.invalidateQueries({ queryKey: ["budgetBalance"] });
      queryClient.invalidateQueries({ queryKey: ["anniversaries"] });
    },
  });
}

// Localities - Paginated
export function useGetPaginatedLocalities(page = 1, pageSize = 20) {
  const { actor, isFetching } = useActor();

  return useQuery<PaginatedResult_6>({
    queryKey: ["localities", "paginated", page, pageSize],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getPaginatedLocalities(BigInt(page), BigInt(pageSize));
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    gcTime: 300000,
  });
}

export function useGetPaginatedLocalitiesWithParishioners(
  page = 1,
  pageSize = 20,
) {
  const { actor, isFetching } = useActor();

  return useQuery<PaginatedResult_5>({
    queryKey: ["localitiesWithParishioners", "paginated", page, pageSize],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getPaginatedLocalitiesWithParishioners(
        BigInt(page),
        BigInt(pageSize),
      );
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    gcTime: 300000,
  });
}

export function useAddLocality() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (locality: Locality) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addLocality(locality);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["localities"] });
      queryClient.invalidateQueries({
        queryKey: ["localitiesWithParishioners"],
      });
    },
  });
}

export function useUpdateLocality() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      locality,
    }: { name: string; locality: Locality }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateLocality(name, locality);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["localities"] });
      queryClient.invalidateQueries({
        queryKey: ["localitiesWithParishioners"],
      });
    },
  });
}

export function useDeleteLocality() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteLocality(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["localities"] });
      queryClient.invalidateQueries({
        queryKey: ["localitiesWithParishioners"],
      });
    },
  });
}

// Budget Balance - Direct from backend for guaranteed accuracy
export function useGetOverallBudgetBalance() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ["budgetBalance"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getOverallBudgetBalance();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    gcTime: 300000,
    placeholderData: BigInt(0),
  });
}

// Budget Transactions - Paginated
export function useGetPaginatedBudgetTransactions(page = 1, pageSize = 20) {
  const { actor, isFetching } = useActor();

  return useQuery<PaginatedResult_10>({
    queryKey: ["budgetTransactions", "paginated", page, pageSize],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getPaginatedBudgetTransactions(
        BigInt(page),
        BigInt(pageSize),
      );
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    gcTime: 300000,
  });
}

export function useGetPaginatedBudgetTransactionsByDateRange(
  startTimestamp: bigint,
  endTimestamp: bigint,
  page = 1,
  pageSize = 20,
) {
  const { actor, isFetching } = useActor();

  return useQuery<PaginatedResult_10>({
    queryKey: [
      "budgetTransactions",
      "dateRange",
      startTimestamp.toString(),
      endTimestamp.toString(),
      page,
      pageSize,
    ],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getPaginatedBudgetTransactionsByDateRange(
        BigInt(page),
        BigInt(pageSize),
        startTimestamp,
        endTimestamp,
      );
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    gcTime: 300000,
    placeholderData: {
      data: [],
      totalCount: BigInt(0),
      pageCount: BigInt(1),
      currentPage: BigInt(page),
      pageSize: BigInt(pageSize),
    },
  });
}

// Budget Transactions - All for year (for yearly balance calculation) - Optimized with lazy loading
export function useGetAllBudgetTransactionsByYear(year: number) {
  const { actor, isFetching } = useActor();

  return useQuery<BudgetTransaction[]>({
    queryKey: ["budgetTransactions", "year", year],
    queryFn: async () => {
      if (!actor) return [];
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);
      const startTimestamp = BigInt(startOfYear.getTime() * 1000000);
      const endTimestamp = BigInt(endOfYear.getTime() * 1000000);

      const result = await actor.getPaginatedBudgetTransactionsByDateRange(
        BigInt(1),
        BigInt(10000),
        startTimestamp,
        endTimestamp,
      );
      return result.data;
    },
    enabled: !!actor && !isFetching,
    staleTime: 60000,
    gcTime: 300000,
    placeholderData: [],
  });
}

export function useAddBudgetTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: BudgetTransaction) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addBudgetTransaction(transaction);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgetTransactions"] });
      queryClient.invalidateQueries({ queryKey: ["budgetBalance"] });
    },
  });
}

export function useUpdateBudgetTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      uid,
      transaction,
    }: { uid: UniqueId; transaction: BudgetTransaction }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateBudgetTransaction(uid, transaction);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgetTransactions"] });
      queryClient.invalidateQueries({ queryKey: ["budgetBalance"] });
    },
  });
}

export function useDeleteBudgetTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uid: UniqueId) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteBudgetTransaction(uid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgetTransactions"] });
      queryClient.invalidateQueries({ queryKey: ["budgetBalance"] });
    },
  });
}

// Events - Paginated
export function useGetPaginatedEvents(page = 1, pageSize = 20) {
  const { actor, isFetching } = useActor();

  return useQuery<PaginatedResult_8>({
    queryKey: ["events", "paginated", page, pageSize],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getPaginatedEvents(BigInt(page), BigInt(pageSize));
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    gcTime: 300000,
  });
}

export function useUpdateEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, event }: { id: UniqueId; event: Event }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateEvent(id, event);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useDeleteEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: UniqueId) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteEvent(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

// Parish Function Assignments
export function useGetPaginatedParishFunctionAssignments(
  page = 1,
  pageSize = 20,
) {
  const { actor, isFetching } = useActor();

  return useQuery<PaginatedResult_4>({
    queryKey: ["parishFunctionAssignments", "paginated", page, pageSize],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getPaginatedParishFunctionAssignments(
        BigInt(page),
        BigInt(pageSize),
      );
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    gcTime: 300000,
  });
}

export function useGetPaginatedParishFunctionLocalityAssignments(
  page = 1,
  pageSize = 20,
) {
  const { actor, isFetching } = useActor();

  return useQuery<PaginatedResult_3>({
    queryKey: [
      "parishFunctionLocalityAssignments",
      "paginated",
      page,
      pageSize,
    ],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getPaginatedParishFunctionLocalityAssignments(
        BigInt(page),
        BigInt(pageSize),
      );
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    gcTime: 300000,
  });
}

export function useUpdateParishFunctionAssignment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      assignment,
    }: { id: UniqueId; assignment: ParishFunctionAssignment }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateParishFunctionAssignment(id, assignment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["parishFunctionAssignments"],
      });
    },
  });
}

export function useDeleteParishFunctionAssignment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: UniqueId) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteParishFunctionAssignment(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["parishFunctionAssignments"],
      });
    },
  });
}

export function useUpdateParishFunctionLocalityAssignment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      assignment,
    }: { id: UniqueId; assignment: ParishFunctionLocalityAssignment }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateParishFunctionLocalityAssignment(id, assignment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["parishFunctionLocalityAssignments"],
      });
    },
  });
}

export function useDeleteParishFunctionLocalityAssignment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: UniqueId) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteParishFunctionLocalityAssignment(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["parishFunctionLocalityAssignments"],
      });
    },
  });
}

// Statistics
export function useGetPaginatedStatisticEntries(page = 1, pageSize = 20) {
  const { actor, isFetching } = useActor();

  return useQuery<PaginatedResult>({
    queryKey: ["statistics", "paginated", page, pageSize],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getPaginatedStatisticEntries(BigInt(page), BigInt(pageSize));
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    gcTime: 300000,
  });
}

export function useUpdateStatisticEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      entry,
    }: { id: UniqueId; entry: StatisticEntry }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateStatisticEntry(id, entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
    },
  });
}

export function useDeleteStatisticEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: UniqueId) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteStatisticEntry(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
    },
  });
}

// Parish Notes
export function useGetPaginatedParishNotes(page = 1, pageSize = 20) {
  const { actor, isFetching } = useActor();

  return useQuery<PaginatedResult_2>({
    queryKey: ["parishNotes", "paginated", page, pageSize],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getPaginatedParishNotes(BigInt(page), BigInt(pageSize));
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    gcTime: 300000,
  });
}

export function useUpdateParishNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, note }: { id: UniqueId; note: ParishNote }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateParishNote(id, note);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parishNotes"] });
    },
  });
}

export function useDeleteParishNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: UniqueId) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteParishNote(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parishNotes"] });
    },
  });
}

// Collective Offerings
export function useGetPaginatedCollectiveOfferings(page = 1, pageSize = 20) {
  const { actor, isFetching } = useActor();

  return useQuery<PaginatedResult_9>({
    queryKey: ["collectiveOfferings", "paginated", page, pageSize],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getPaginatedCollectiveOfferings(
        BigInt(page),
        BigInt(pageSize),
      );
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    gcTime: 300000,
  });
}

export function useGetCollectiveOfferingsByLocality(locality: string) {
  const { actor, isFetching } = useActor();

  return useQuery<CollectiveOffering[]>({
    queryKey: ["collectiveOfferings", "locality", locality],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCollectiveOfferingsByLocality(locality);
    },
    enabled: !!actor && !isFetching && !!locality,
    staleTime: 30000,
    gcTime: 300000,
  });
}

export function useAddCollectiveOffering() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (offering: CollectiveOffering) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addCollectiveOffering(offering);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collectiveOfferings"] });
      queryClient.invalidateQueries({ queryKey: ["budgetTransactions"] });
      queryClient.invalidateQueries({ queryKey: ["budgetBalance"] });
    },
  });
}

export function useUpdateCollectiveOffering() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      offering,
    }: { id: UniqueId; offering: CollectiveOffering }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateCollectiveOffering(id, offering);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collectiveOfferings"] });
      queryClient.invalidateQueries({ queryKey: ["budgetTransactions"] });
      queryClient.invalidateQueries({ queryKey: ["budgetBalance"] });
    },
  });
}

export function useDeleteCollectiveOffering() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: UniqueId) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteCollectiveOffering(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collectiveOfferings"] });
      queryClient.invalidateQueries({ queryKey: ["budgetTransactions"] });
      queryClient.invalidateQueries({ queryKey: ["budgetBalance"] });
    },
  });
}

// Individual Offerings
export function useGetPaginatedIndividualOfferings(page = 1, pageSize = 20) {
  const { actor, isFetching } = useActor();

  return useQuery<PaginatedResult_7>({
    queryKey: ["individualOfferings", "paginated", page, pageSize],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getPaginatedIndividualOfferings(
        BigInt(page),
        BigInt(pageSize),
      );
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    gcTime: 300000,
  });
}

export function useGetIndividualOfferingsByParishioner(parishionerId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<IndividualOffering[]>({
    queryKey: ["individualOfferings", "parishioner", parishionerId.toString()],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getIndividualOfferingsByParishioner(parishionerId);
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    gcTime: 300000,
  });
}

export function useAddIndividualOffering() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (offering: IndividualOffering) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addIndividualOffering(offering);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["individualOfferings"] });
      queryClient.invalidateQueries({ queryKey: ["budgetTransactions"] });
      queryClient.invalidateQueries({ queryKey: ["budgetBalance"] });
    },
  });
}

export function useUpdateIndividualOffering() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      offering,
    }: { id: UniqueId; offering: IndividualOffering }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateIndividualOffering(id, offering);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["individualOfferings"] });
      queryClient.invalidateQueries({ queryKey: ["budgetTransactions"] });
      queryClient.invalidateQueries({ queryKey: ["budgetBalance"] });
    },
  });
}

export function useDeleteIndividualOffering() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: UniqueId) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteIndividualOffering(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["individualOfferings"] });
      queryClient.invalidateQueries({ queryKey: ["budgetTransactions"] });
      queryClient.invalidateQueries({ queryKey: ["budgetBalance"] });
    },
  });
}

// Letters
export function useGetAllLetters() {
  const { actor, isFetching } = useActor();

  return useQuery<Letter[]>({
    queryKey: ["letters"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getAllLetters();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    gcTime: 300000,
  });
}

export function useAddLetter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      body,
      year,
      adresat,
    }: { title: string; body: string; year: bigint; adresat?: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addLetter(title, body, year, adresat || null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["letters"] });
    },
  });
}

export function useUpdateLetter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      uid,
      title,
      body,
      adresat,
    }: { uid: bigint; title: string; body: string; adresat?: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateLetter(uid, title, body, adresat || null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["letters"] });
    },
  });
}

export function useDeleteLetter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uid: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteLetter(uid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["letters"] });
    },
  });
}

// Anniversaries
export function useGetAnniversariesForYearPaginated(
  request: GetAnniversariesRequest,
) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: [
      "anniversaries",
      "paginated",
      request.year.toString(),
      request.anniversaryType,
      request.page?.toString(),
      request.pageSize?.toString(),
    ],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getAnniversariesForYearPaginated({
        year: BigInt(request.year),
        anniversaryType: request.anniversaryType,
        page: request.page ? BigInt(request.page) : undefined,
        pageSize: request.pageSize ? BigInt(request.pageSize) : undefined,
      });
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    gcTime: 300000,
  });
}

export function useGetAnniversariesForYearPdfExport(
  request: GetAnniversariesPdfExportRequest,
) {
  const { actor, isFetching } = useActor();

  return useQuery<AnniversaryPdfExport>({
    queryKey: [
      "anniversaries",
      "pdfExport",
      request.year.toString(),
      request.anniversaryType,
    ],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getAnniversariesForYearPdfExport({
        year: BigInt(request.year),
        anniversaryType: request.anniversaryType,
      });
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    gcTime: 300000,
  });
}

// Baptism Registry
export function useGetBaptismRegistry(
  page = 1,
  pageSize = 20,
  search?: string,
  sortMode?: BaptismRecordSortMode,
) {
  const { actor, isFetching } = useActor();

  return useQuery<PaginatedResult_11>({
    queryKey: [
      "baptismRegistry",
      "paginated",
      page,
      pageSize,
      search,
      sortMode,
    ],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getBaptismRegistry({
        page: BigInt(page),
        pageSize: BigInt(pageSize),
        search: search || undefined,
        sortMode: sortMode || undefined,
      });
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    gcTime: 300000,
  });
}

export function useCreateBaptismRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (record: BaptismRecord) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createBaptismRecord(record);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["baptismRegistry"] });
    },
  });
}

export function useUpdateBaptismRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      record,
    }: { id: bigint; record: BaptismRecord }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateBaptismRecord(id, record);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["baptismRegistry"] });
    },
  });
}

export function useDeleteBaptismRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteBaptismRecord(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["baptismRegistry"] });
    },
  });
}
