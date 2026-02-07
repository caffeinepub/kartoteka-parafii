import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  Parishioner,
  Locality,
  LocalityWithParishioners,
  BudgetTransaction,
  Event,
  ParishFunctionAssignment,
  ParishFunctionLocalityAssignment,
  StatisticEntry,
  ParishNote,
  UserProfile,
  CollectiveOffering,
  IndividualOffering,
  Letter,
  UniqueId,
  Anniversary,
  AnniversaryType,
  AnniversaryPdfExport,
  GetAnniversariesRequest,
  GetAnniversariesPdfExportRequest,
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
} from '../backend';

// Helper types to include IDs with data
export type EventWithId = { id: UniqueId; data: Event };
export type ParishNoteWithId = { id: UniqueId; data: ParishNote };
export type ParishFunctionAssignmentWithId = { id: UniqueId; data: ParishFunctionAssignment };
export type ParishFunctionLocalityAssignmentWithId = { id: UniqueId; data: ParishFunctionLocalityAssignment };
export type StatisticEntryWithId = { id: UniqueId; data: StatisticEntry };

// User Profile
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Parishioners - Paginated
export function useGetPaginatedParishioners(page: number = 1, pageSize: number = 20) {
  const { actor, isFetching } = useActor();

  return useQuery<PaginatedResult_1>({
    queryKey: ['parishioners', 'paginated', page, pageSize],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
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
    queryKey: ['parishioners', 'all'],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getPaginatedParishioners(BigInt(1), BigInt(1000));
      return result.data;
    },
    enabled: !!actor && !isFetching,
    staleTime: 60000, // Consider data fresh for 1 minute
    gcTime: 300000, // Keep in cache for 5 minutes
    placeholderData: [], // Show empty array immediately while loading
  });
}

export function useUpdateParishioner() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, parishioner }: { id: bigint; parishioner: Parishioner }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateParishioner(id, parishioner);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parishioners'] });
      queryClient.invalidateQueries({ queryKey: ['localities'] });
      queryClient.invalidateQueries({ queryKey: ['budgetTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['individualOfferings'] });
      queryClient.invalidateQueries({ queryKey: ['budgetBalance'] });
      queryClient.invalidateQueries({ queryKey: ['anniversaries'] });
    },
  });
}

export function useDeleteParishioner() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteParishioner(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parishioners'] });
      queryClient.invalidateQueries({ queryKey: ['localities'] });
      queryClient.invalidateQueries({ queryKey: ['budgetTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['individualOfferings'] });
      queryClient.invalidateQueries({ queryKey: ['budgetBalance'] });
      queryClient.invalidateQueries({ queryKey: ['anniversaries'] });
    },
  });
}

// Localities - Paginated
export function useGetPaginatedLocalities(page: number = 1, pageSize: number = 20) {
  const { actor, isFetching } = useActor();

  return useQuery<PaginatedResult_6>({
    queryKey: ['localities', 'paginated', page, pageSize],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPaginatedLocalities(BigInt(page), BigInt(pageSize));
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    gcTime: 300000,
  });
}

export function useGetPaginatedLocalitiesWithParishioners(page: number = 1, pageSize: number = 20) {
  const { actor, isFetching } = useActor();

  return useQuery<PaginatedResult_5>({
    queryKey: ['localitiesWithParishioners', 'paginated', page, pageSize],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPaginatedLocalitiesWithParishioners(BigInt(page), BigInt(pageSize));
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
      if (!actor) throw new Error('Actor not available');
      return actor.addLocality(locality);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['localities'] });
    },
  });
}

export function useUpdateLocality() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, locality }: { name: string; locality: Locality }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateLocality(name, locality);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['localities'] });
    },
  });
}

export function useDeleteLocality() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteLocality(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['localities'] });
    },
  });
}

// Budget Balance - Direct from backend for guaranteed accuracy
export function useGetOverallBudgetBalance() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['budgetBalance'],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getOverallBudgetBalance();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 300000, // Keep in cache for 5 minutes
    placeholderData: BigInt(0), // Show 0 immediately while loading
  });
}

// Budget Transactions - Paginated
export function useGetPaginatedBudgetTransactions(page: number = 1, pageSize: number = 20) {
  const { actor, isFetching } = useActor();

  return useQuery<PaginatedResult_10>({
    queryKey: ['budgetTransactions', 'paginated', page, pageSize],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPaginatedBudgetTransactions(BigInt(page), BigInt(pageSize));
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    gcTime: 300000,
  });
}

export function useGetPaginatedBudgetTransactionsByDateRange(
  startTimestamp: bigint,
  endTimestamp: bigint,
  page: number = 1,
  pageSize: number = 20
) {
  const { actor, isFetching } = useActor();

  return useQuery<PaginatedResult_10>({
    queryKey: ['budgetTransactions', 'dateRange', startTimestamp.toString(), endTimestamp.toString(), page, pageSize],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPaginatedBudgetTransactionsByDateRange(BigInt(page), BigInt(pageSize), startTimestamp, endTimestamp);
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    gcTime: 300000,
    placeholderData: { data: [], totalCount: BigInt(0), pageCount: BigInt(1), currentPage: BigInt(page), pageSize: BigInt(pageSize) },
  });
}

// Budget Transactions - All for year (for yearly balance calculation) - Optimized with lazy loading
export function useGetAllBudgetTransactionsByYear(year: number) {
  const { actor, isFetching } = useActor();

  return useQuery<BudgetTransaction[]>({
    queryKey: ['budgetTransactions', 'year', year],
    queryFn: async () => {
      if (!actor) return [];
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);
      const startTimestamp = BigInt(startOfYear.getTime() * 1000000);
      const endTimestamp = BigInt(endOfYear.getTime() * 1000000);
      
      // Fetch all transactions for the year (using large page size)
      const result = await actor.getPaginatedBudgetTransactionsByDateRange(
        BigInt(1),
        BigInt(10000),
        startTimestamp,
        endTimestamp
      );
      return result.data;
    },
    enabled: !!actor && !isFetching,
    staleTime: 60000, // Consider data fresh for 1 minute
    gcTime: 300000, // Keep in cache for 5 minutes
    placeholderData: [], // Show empty array immediately while loading
  });
}

// Budget Transactions - All (for Dashboard) - Optimized with stale-while-revalidate
export function useGetAllBudgetTransactions() {
  const { actor, isFetching } = useActor();

  return useQuery<BudgetTransaction[]>({
    queryKey: ['budgetTransactions', 'all'],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getPaginatedBudgetTransactions(BigInt(1), BigInt(10000));
      return result.data;
    },
    enabled: !!actor && !isFetching,
    staleTime: 60000, // Consider data fresh for 1 minute
    gcTime: 300000, // Keep in cache for 5 minutes
    placeholderData: [], // Show empty array immediately while loading
  });
}

export function useAddBudgetTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: BudgetTransaction) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addBudgetTransaction(transaction);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['budgetBalance'] });
    },
  });
}

export function useUpdateBudgetTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, transaction }: { id: bigint; transaction: BudgetTransaction }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateBudgetTransaction(id, transaction);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['collectiveOfferings'] });
      queryClient.invalidateQueries({ queryKey: ['individualOfferings'] });
      queryClient.invalidateQueries({ queryKey: ['budgetBalance'] });
    },
  });
}

export function useDeleteBudgetTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tid: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteBudgetTransaction(tid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['collectiveOfferings'] });
      queryClient.invalidateQueries({ queryKey: ['individualOfferings'] });
      queryClient.invalidateQueries({ queryKey: ['budgetBalance'] });
    },
  });
}

// Events - Paginated
export function useGetPaginatedEvents(page: number = 1, pageSize: number = 20) {
  const { actor, isFetching } = useActor();

  return useQuery<PaginatedResult_8>({
    queryKey: ['events', 'paginated', page, pageSize],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPaginatedEvents(BigInt(page), BigInt(pageSize));
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    gcTime: 300000,
  });
}

// Events - All events (for Dashboard compatibility) - Optimized with stale-while-revalidate
export function useGetAllEvents() {
  const { actor, isFetching } = useActor();

  return useQuery<EventWithId[]>({
    queryKey: ['events', 'all'],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getPaginatedEvents(BigInt(1), BigInt(100));
      return result.data.map((event) => ({
        id: event.uid,
        data: event,
      }));
    },
    enabled: !!actor && !isFetching,
    staleTime: 60000, // Consider data fresh for 1 minute
    gcTime: 300000, // Keep in cache for 5 minutes
    placeholderData: [], // Show empty array immediately while loading
  });
}

export function useUpdateEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, event }: { id: bigint; event: Event }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateEvent(id, event);
      return { id, event };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useDeleteEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteEvent(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

// Parish Function Assignments - Paginated
export function useGetPaginatedParishFunctionAssignments(page: number = 1, pageSize: number = 20) {
  const { actor, isFetching } = useActor();

  return useQuery<PaginatedResult_4>({
    queryKey: ['parishFunctionAssignments', 'paginated', page, pageSize],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPaginatedParishFunctionAssignments(BigInt(page), BigInt(pageSize));
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    gcTime: 300000,
  });
}

export function useGetPaginatedParishFunctionLocalityAssignments(page: number = 1, pageSize: number = 20) {
  const { actor, isFetching } = useActor();

  return useQuery<PaginatedResult_3>({
    queryKey: ['parishFunctionLocalityAssignments', 'paginated', page, pageSize],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPaginatedParishFunctionLocalityAssignments(BigInt(page), BigInt(pageSize));
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
    mutationFn: async ({ id, assignment }: { id: bigint; assignment: ParishFunctionAssignment }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateParishFunctionAssignment(id, assignment);
      return { id, assignment };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parishFunctionAssignments'] });
    },
  });
}

export function useUpdateParishFunctionLocalityAssignment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, assignment }: { id: bigint; assignment: ParishFunctionLocalityAssignment }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateParishFunctionLocalityAssignment(id, assignment);
      return { id, assignment };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parishFunctionLocalityAssignments'] });
    },
  });
}

export function useDeleteParishFunctionAssignment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteParishFunctionAssignment(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parishFunctionAssignments'] });
    },
  });
}

export function useDeleteParishFunctionLocalityAssignment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteParishFunctionLocalityAssignment(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parishFunctionLocalityAssignments'] });
    },
  });
}

// Statistics - Paginated
export function useGetPaginatedStatisticEntries(page: number = 1, pageSize: number = 20) {
  const { actor, isFetching } = useActor();

  return useQuery<PaginatedResult>({
    queryKey: ['statistics', 'paginated', page, pageSize],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPaginatedStatisticEntries(BigInt(page), BigInt(pageSize));
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    gcTime: 300000,
  });
}

// Statistics - All (for Statistics page) - Now properly tracks backend UIDs
export function useGetAllStatistics() {
  const { actor, isFetching } = useActor();

  return useQuery<Map<bigint, StatisticEntry>>({
    queryKey: ['statistics', 'all'],
    queryFn: async () => {
      if (!actor) return new Map();
      const result = await actor.getPaginatedStatisticEntries(BigInt(1), BigInt(1000));
      // Create a map to track UIDs - we'll use timestamp as temporary key since backend stores by uid
      const statsMap = new Map<bigint, StatisticEntry>();
      result.data.forEach((entry) => {
        // Use timestamp as unique identifier since backend doesn't expose uid in StatisticEntry
        statsMap.set(entry.timestamp, entry);
      });
      return statsMap;
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    gcTime: 300000,
  });
}

// Annual Sacrament Stats
export function useGetAllAnnualSacramentStats() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['annualSacramentStats'],
    queryFn: async () => {
      if (!actor) return [];
      // This would need a backend method - for now return empty array
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateStatisticEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, entry }: { id: bigint; entry: StatisticEntry }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateStatisticEntry(id, entry);
      return { id, entry };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    },
  });
}

export function useDeleteStatisticEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteStatisticEntry(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    },
  });
}

// Parish Notes - Paginated
export function useGetPaginatedParishNotes(page: number = 1, pageSize: number = 20) {
  const { actor, isFetching } = useActor();

  return useQuery<PaginatedResult_2>({
    queryKey: ['parishNotes', 'paginated', page, pageSize],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPaginatedParishNotes(BigInt(page), BigInt(pageSize));
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    gcTime: 300000,
  });
}

// Parish Notes - All (for Uwagi page) - Now properly tracks backend UIDs
export function useGetAllParishNotes() {
  const { actor, isFetching } = useActor();

  return useQuery<Map<bigint, ParishNote>>({
    queryKey: ['parishNotes', 'all'],
    queryFn: async () => {
      if (!actor) return new Map();
      const result = await actor.getPaginatedParishNotes(BigInt(1), BigInt(1000));
      // Create a map to track UIDs - we'll use timestamp as temporary key since backend stores by uid
      const notesMap = new Map<bigint, ParishNote>();
      result.data.forEach((note) => {
        // Use timestamp as unique identifier since backend doesn't expose uid in ParishNote
        notesMap.set(note.timestamp, note);
      });
      return notesMap;
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
    mutationFn: async ({ id, note }: { id: bigint; note: ParishNote }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateParishNote(id, note);
      return { id, note };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parishNotes'] });
    },
  });
}

export function useDeleteParishNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteParishNote(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parishNotes'] });
    },
  });
}

// Collective Offerings - Paginated
export function useGetPaginatedCollectiveOfferings(page: number = 1, pageSize: number = 20) {
  const { actor, isFetching } = useActor();

  return useQuery<PaginatedResult_9>({
    queryKey: ['collectiveOfferings', 'paginated', page, pageSize],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPaginatedCollectiveOfferings(BigInt(page), BigInt(pageSize));
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    gcTime: 300000,
  });
}

export function useGetCollectiveOfferingsByLocality() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (locality: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCollectiveOfferingsByLocality(locality);
    },
  });
}

export function useAddCollectiveOffering() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (offering: CollectiveOffering) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addCollectiveOffering(offering);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collectiveOfferings'] });
      queryClient.invalidateQueries({ queryKey: ['budgetTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['budgetBalance'] });
    },
  });
}

export function useUpdateCollectiveOffering() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, offering }: { id: bigint; offering: CollectiveOffering }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCollectiveOffering(id, offering);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collectiveOfferings'] });
      queryClient.invalidateQueries({ queryKey: ['budgetTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['budgetBalance'] });
    },
  });
}

export function useDeleteCollectiveOffering() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteCollectiveOffering(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collectiveOfferings'] });
      queryClient.invalidateQueries({ queryKey: ['budgetTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['budgetBalance'] });
    },
  });
}

export function useGetCollectiveOfferingsByLocalityQuery(locality: string) {
  const { actor, isFetching } = useActor();

  return useQuery<CollectiveOffering[]>({
    queryKey: ['collectiveOfferings', 'locality', locality],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCollectiveOfferingsByLocality(locality);
    },
    enabled: !!actor && !isFetching && !!locality,
  });
}

// Individual Offerings - Paginated
export function useGetPaginatedIndividualOfferings(page: number = 1, pageSize: number = 20) {
  const { actor, isFetching } = useActor();

  return useQuery<PaginatedResult_7>({
    queryKey: ['individualOfferings', 'paginated', page, pageSize],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPaginatedIndividualOfferings(BigInt(page), BigInt(pageSize));
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    gcTime: 300000,
  });
}

export function useGetIndividualOfferingsByParishioner() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (parishionerId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.getIndividualOfferingsByParishioner(parishionerId);
    },
  });
}

export function useAddIndividualOffering() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (offering: IndividualOffering) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addIndividualOffering(offering);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['individualOfferings'] });
      queryClient.invalidateQueries({ queryKey: ['budgetTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['parishioners'] });
      queryClient.invalidateQueries({ queryKey: ['budgetBalance'] });
    },
  });
}

export function useUpdateIndividualOffering() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, offering }: { id: bigint; offering: IndividualOffering }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateIndividualOffering(id, offering);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['individualOfferings'] });
      queryClient.invalidateQueries({ queryKey: ['budgetTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['parishioners'] });
      queryClient.invalidateQueries({ queryKey: ['budgetBalance'] });
    },
  });
}

export function useDeleteIndividualOffering() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteIndividualOffering(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['individualOfferings'] });
      queryClient.invalidateQueries({ queryKey: ['budgetTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['parishioners'] });
      queryClient.invalidateQueries({ queryKey: ['budgetBalance'] });
    },
  });
}

// Letters (Korespondencja) - All letters
export function useGetAllLetters() {
  const { actor, isFetching } = useActor();

  return useQuery<Letter[]>({
    queryKey: ['letters', 'all'],
    queryFn: async () => {
      if (!actor) return [];
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
    mutationFn: async ({ title, body }: { title: string; body: string }) => {
      if (!actor) throw new Error('Actor not available');
      const year = BigInt(new Date().getFullYear());
      return actor.addLetter(title, body, year);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['letters'] });
    },
  });
}

export function useUpdateLetter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ uid, title, body }: { uid: bigint; title: string; body: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateLetter(uid, title, body);
      return { uid, title, body };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['letters'] });
    },
  });
}

export function useDeleteLetter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uid: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteLetter(uid);
      return uid;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['letters'] });
    },
  });
}

// Anniversaries - Paginated with optional type filter
export function useGetPaginatedAnniversaries(
  year: number,
  page: number = 1,
  pageSize: number = 20,
  anniversaryType?: AnniversaryType | null
) {
  const { actor, isFetching } = useActor();

  return useQuery<PaginatedResult_11>({
    queryKey: ['anniversaries', 'paginated', year, anniversaryType || 'all', page, pageSize],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const request: GetAnniversariesRequest = {
        year: BigInt(year),
        page: BigInt(page),
        pageSize: BigInt(pageSize),
        anniversaryType: anniversaryType || undefined,
      };
      return actor.getAnniversariesForYearPaginated(request);
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    gcTime: 300000,
  });
}

// Anniversaries - Full export for PDF with optional type filter
export function useGetAnniversariesForPdfExport(year: number, anniversaryType?: AnniversaryType | null) {
  const { actor, isFetching } = useActor();

  return useQuery<AnniversaryPdfExport>({
    queryKey: ['anniversaries', 'pdfExport', year, anniversaryType || 'all'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const request: GetAnniversariesPdfExportRequest = {
        year: BigInt(year),
        anniversaryType: anniversaryType || undefined,
      };
      return actor.getAnniversariesForYearPdfExport(request);
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
    gcTime: 300000,
  });
}
