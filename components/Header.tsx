import Link from "next/link"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"
import SearchBar from "./SearchBar"
import { Button } from "./ui/button"
import { ModeToggle } from "./ModeToggle"

const Header = () => {
	return (
		<header className="border-b z-10 sticky top-0 sm:px-5 backdrop-blur-md">
			<nav className="flex flex-col lg:flex-row items-center gap-4 p-4">
				<div className="flex items-center justify-between w-full lg:w-auto">
					<Link href="/" className="font-bold shrink-0 mr-5">
            <h1 className="text-2xl">Next<span className="text-primary">Ticket</span></h1>
					</Link>

					<div className="flex items-center gap-2 lg:hidden">
            <ModeToggle />
						<SignedIn>
							<UserButton />
						</SignedIn>

						<SignedOut>
							<SignInButton mode="modal">
								<Button>
									Sign In
								</Button>
							</SignInButton>
						</SignedOut>
					</div>
				</div>

				{/* Search Bar - full width on mobile */}
				<div className="w-full lg:max-w-2xl">
					<SearchBar />
				</div>


        <div className="hidden lg:flex gap-2 ml-auto">
          <ModeToggle />
          <SignedIn>
            <div className="flex items-center gap-3">
              <Link href="/seller">
                <Button>
                  Sell Tickets
								</Button>
              </Link>

              <Link href="/tickets">
                <Button variant="secondary">
                  My Tickets
                </Button>
              </Link>
              <UserButton />
            </div>
          </SignedIn>

					<SignedOut>
            <SignInButton mode="modal">
              <Button>
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>
				</div>

				{/* Mobile Action Buttons */}
        <div className="lg:hidden w-full flex justify-center gap-3">
          <SignedIn>
            <Button asChild>
              <Link href="/seller" className="flex-1">
                Sell Tickets
              </Link>
            </Button>

            <Button variant="secondary" asChild>
              <Link href="/tickets" className="flex-1">
                My Tickets
              </Link>
            </Button>
          </SignedIn>
        </div>

			</nav>
		</header>
	)
}

export default Header