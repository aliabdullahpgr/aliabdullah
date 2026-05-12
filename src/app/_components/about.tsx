interface AboutProps {
  name?: string;
  role?: string;
  location?: string;
  bio2?: string;
  skills?: string;
  company?: string;
  university?: string;
}

export function About({
  name,
  role,
  location,
  bio2,
  skills,
  company,
  university,
}: AboutProps) {
  return (
    <section className="section" id="about">
      <div className="wrap">
        <div className="section-label">About</div>
        <div className="about-body">
          <p>
            <b>{name ?? "Ali Abdullah"}</b> — {role ?? "Software Engineer"} in{" "}
            {location ?? "Multan, Pakistan"}.
            {university &&
              ` Pursuing a BS in Computer Science at ${university}.`}
            {company &&
              ` Currently building a scalable blogging platform at ${company}.`}
          </p>
          <p>
            {bio2 ??
              "I work across the full stack and care about clean interfaces, honest backend APIs, and AI-powered tools that solve real problems."}
          </p>
          <p className="mono">
            {skills ?? "ts · react · next · node · mongo · python · docker"}
          </p>
        </div>
      </div>
    </section>
  );
}
