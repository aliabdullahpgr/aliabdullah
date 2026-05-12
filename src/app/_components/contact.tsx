import Link from "next/link";

interface ContactProps {
  email?: string;
  github?: string;
  linkedin?: string;
  location?: string;
}

export function Contact({ email, github, linkedin, location }: ContactProps) {
  return (
    <section className="contact" id="contact">
      <div className="wrap">
        <div className="contact-pre">Contact</div>
        <h2>
          Want to talk
          <br />
          about{" "}
          <Link href={`mailto:${email ?? "aliabdullah3676@gmail.com"}`}>
            tech&nbsp;→
          </Link>
        </h2>
        <div className="contact-meta">
          <div>
            <span>Email</span>
            <Link href={`mailto:${email ?? "aliabdullah3676@gmail.com"}`}>
              {email ?? "aliabdullah3676@gmail.com"}
            </Link>
          </div>
          <div>
            <span>GitHub</span>
            <Link href={github ?? "#"}>
              {github
                ? github.replace(/^https?:\/\//, "")
                : "github.com/aliabdullah"}
            </Link>
          </div>
          <div>
            <span>LinkedIn</span>
            <Link href={linkedin ?? "#"}>
              {linkedin
                ? linkedin.replace(/^https?:\/\//, "")
                : "linkedin.com/in/aliabdullah"}
            </Link>
          </div>
          <div>
            <span>Location</span>
            {location ?? "Multan, Pakistan"}
          </div>
        </div>
      </div>
    </section>
  );
}
