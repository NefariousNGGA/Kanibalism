import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-16 md:py-24">
        <article className="max-w-2xl mx-auto px-6 md:px-8">
          <header className="mb-12">
            <h1 className="font-serif text-3xl md:text-4xl font-semibold mb-4">
              About This Space
            </h1>
            <p className="text-lg text-muted-foreground">
              A philosophy of intentional restraint.
            </p>
          </header>

          <div className="prose prose-lg dark:prose-invert font-serif space-y-8">
            <section>
              <h2 className="font-serif text-xl font-semibold mb-4 text-foreground">
                What This Is
              </h2>
              <p className="text-foreground/90 leading-relaxed">
                This isn't a blog in the traditional sense. It's not optimized for engagement, 
                discovery, or growth. It's a digital space for thoughts that exist in the 
                periphery—ideas too quiet for the noise of social media, too heavy to simply 
                float away.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold mb-4 text-foreground">
                What This Isn't
              </h2>
              <p className="text-foreground/90 leading-relaxed">
                You won't find comments sections here. Some thoughts are meant to be read, 
                not responded to. Some ideas need to sit with you quietly, without the 
                pressure of immediate reaction.
              </p>
              <p className="text-foreground/90 leading-relaxed">
                There are no share buttons begging for attention, no newsletter popups 
                demanding your email, no cookie banners larger than the content itself. 
                Just words.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold mb-4 text-foreground">
                The Philosophy
              </h2>
              <p className="text-foreground/90 leading-relaxed">
                Every design choice here is intentional. The typography is optimized for 
                reading, not scanning. The colors are muted to reduce visual noise. The 
                layout is simple because complexity is often just another form of distraction.
              </p>
              <p className="text-foreground/90 leading-relaxed">
                Thoughts here exist without expectation. They're not written for virality 
                or SEO. They're written because they needed to exist somewhere outside 
                the mind that conceived them.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold mb-4 text-foreground">
                For Readers
              </h2>
              <p className="text-foreground/90 leading-relaxed">
                If you've found your way here, take your time. There's no algorithm 
                pushing you toward the next piece of content. Read what resonates, 
                leave what doesn't. Let thoughts marinate.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-semibold mb-4 text-foreground">
                For Writers
              </h2>
              <p className="text-foreground/90 leading-relaxed">
                If you have thoughts that need a quiet home, you can create an account 
                and contribute. The only requirement is sincerity. Write because you 
                must, not because you should.
              </p>
            </section>
          </div>

          <footer className="mt-16 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground font-mono">
              Built with intention. Maintained with care.
            </p>
          </footer>
        </article>
      </main>

      <Footer />
    </div>
  );
}
