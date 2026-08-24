import http from "k6/http";
import { check, sleep } from "k6";
import { Trend } from "k6/metrics";

const BASE_URL = __ENV.BASE_URL || "https://doli.kaonix.local";

const pageDuration = new Trend("page_duration", true);

const PAGES = [
  { path: "/", name: "home" },
  { path: "/blog/", name: "blog" },
  { path: "/categories/tutorials/", name: "cat-tutorials" },
  { path: "/categories/best-practices/", name: "cat-best-practices" },
  { path: "/categories/news/", name: "cat-news" },
  { path: "/blog/getting-started-with-kubernetes/", name: "post-k8s" },
  { path: "/blog/git-best-practices/", name: "post-git" },
  { path: "/rss.xml", name: "rss" },
];

export const options = {
  scenarios: {
    browse: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "10s", target: 5 }, // warm up
        { duration: "30s", target: 20 }, // steady load
        { duration: "10s", target: 40 }, // spike
        { duration: "10s", target: 0 }, // cool down
      ],
      gracefulRampDown: "5s",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"], // <1% errors
    http_req_duration: ["p(95)<300"], // 95% under 300ms (static site!)
    checks: ["rate>0.99"],
  },
  insecureSkipTLSVerify: true, // mkcert local CA
};

export default function () {
  const page = PAGES[Math.floor(Math.random() * PAGES.length)];
  const res = http.get(`${BASE_URL}${page.path}`, {
    tags: { page: page.name },
  });

  pageDuration.add(res.timings.duration, { page: page.name });

  check(res, {
    [`${page.name} status 200`]: (r) => r.status === 200,
    [`${page.name} has content`]: (r) => r.body.length > 1000,
  });

  sleep(Math.random() * 2 + 1); // think time 1-3s like a real reader
}
