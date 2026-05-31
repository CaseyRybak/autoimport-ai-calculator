import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { demoLeads } from "./lead-demo";
import {
  type AdminLeadFilters,
  filterAndSortAdminLeads,
  getAdminLeadAppliedFilterText,
  getAdminLeadPaginationPages,
  normalizeAdminLeadFilters,
  paginateAdminLeads,
} from "./admin-lead-filters";

const makeFilters = (overrides: Partial<AdminLeadFilters>): AdminLeadFilters => ({
  status: "all",
  search: "",
  sort: "newest",
  page: 1,
  pageSize: 10,
  ...overrides,
});

describe("admin lead filters", () => {
  it("filters by status", () => {
    const leads = filterAndSortAdminLeads(demoLeads, makeFilters({
      status: "in_progress",
    }));

    assert.deepEqual(
      leads.map((lead) => lead.status),
      ["in_progress"],
    );
  });

  it("searches lead number, client, phone, telegram and car", () => {
    for (const search of ["AIC-000002", "Анна", "222-10", "@anna", "BMW"]) {
      const leads = filterAndSortAdminLeads(demoLeads, makeFilters({
        search,
      }));

      assert.equal(leads[0]?.displayNumber, "AIC-000002");
    }
  });

  it("sorts by oldest, budget and total", () => {
    assert.deepEqual(
      filterAndSortAdminLeads(demoLeads, {
        ...makeFilters({}),
        status: "all",
        search: "",
        sort: "oldest",
      }).map((lead) => lead.displayNumber),
      ["AIC-000003", "AIC-000002", "AIC-000001"],
    );

    assert.equal(
      filterAndSortAdminLeads(demoLeads, {
        ...makeFilters({}),
        status: "all",
        search: "",
        sort: "budget_desc",
      })[0]?.displayNumber,
      "AIC-000002",
    );

    assert.equal(
      filterAndSortAdminLeads(demoLeads, {
        ...makeFilters({}),
        status: "all",
        search: "",
        sort: "total_desc",
      })[0]?.displayNumber,
      "AIC-000002",
    );
  });

  it("normalizes query params and formats applied filter text", () => {
    const filters = normalizeAdminLeadFilters({
      status: "in_progress",
      search: " Hyundai ",
      sort: "newest",
    });

    assert.deepEqual(filters, {
      status: "in_progress",
      search: "Hyundai",
      sort: "newest",
      page: 1,
      pageSize: 10,
    });
    assert.equal(
      getAdminLeadAppliedFilterText(filters),
      "Фильтры: В работе · Hyundai · новые сверху",
    );
    assert.equal(
      getAdminLeadAppliedFilterText({
        ...makeFilters({}),
        status: "all",
        search: "",
        sort: "newest",
      }),
      "Фильтры не применены",
    );
  });

  it("normalizes page size and paginates leads", () => {
    const filters = normalizeAdminLeadFilters({
      page: "2",
      pageSize: "50",
    });

    assert.equal(filters.page, 2);
    assert.equal(filters.pageSize, 50);

    const leads = Array.from({ length: 25 }, (_, index) => ({
      ...demoLeads[0],
      id: String(index + 1),
      leadNumber: index + 1,
      displayNumber: `AIC-${String(index + 1).padStart(6, "0")}`,
    }));
    const page = paginateAdminLeads(leads, 2, 10);

    assert.equal(page.totalCount, 25);
    assert.equal(page.page, 2);
    assert.equal(page.pageSize, 10);
    assert.equal(page.totalPages, 3);
    assert.equal(page.items[0]?.displayNumber, "AIC-000011");
  });

  it("limits pagination buttons to a moving window", () => {
    assert.deepEqual(getAdminLeadPaginationPages(1, 3), [1, 2, 3]);
    assert.deepEqual(getAdminLeadPaginationPages(8, 20), [4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });
});
