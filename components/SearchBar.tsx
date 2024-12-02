"use client"

import { Search } from "lucide-react";
import Form from "next/form";
import { Input } from "./ui/input";

const SearchBar = () => {

  return (
    <div className="w-full max-w-4xl mx-auto">
			<Form action={"/search"} className="relative">
				<Input 
					type="text" 
					name="q" 
					placeholder="Search for events..."
          className="w-full px-4 pl-12"
				/>
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
			</Form>
		</div>
  )
}

export default SearchBar