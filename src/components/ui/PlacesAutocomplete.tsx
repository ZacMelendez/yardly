"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Combobox, Loader, TextInput, useCombobox } from "@mantine/core";
import { IconMapPin } from "@tabler/icons-react";
import { fetchJSON } from "@/lib/fetchJson";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";

export interface PlaceResult {
    place_id: string;
    formatted_address: string;
    name?: string;
    geometry?: {
        location: {
            lat: number;
            lng: number;
        };
    };
    address_components?: Array<{
        long_name: string;
        short_name: string;
        types: string[];
    }>;
    types?: string[];
}

export interface PlacesAutocompleteProps {
    /** Current value of the input */
    value?: string;
    /** Callback fired when the input value changes */
    onChange?: (value: string) => void;
    /** Callback fired when a place is selected */
    onPlaceSelect?: (place: PlaceResult) => void;
    /** Placeholder text for the input */
    placeholder?: string;
    /** Input label */
    label?: string;
    /** Error message to display */
    error?: string;
    /** Whether the input is disabled */
    disabled?: boolean;
    /** Whether the input is required */
    required?: boolean;
    /** Additional description */
    description?: string;
    /** Country restriction (ISO 3166-1 Alpha-2 country code) */
    country?: string;
    /** Types of places to search for */
    types?: string;
    /** Loading state */
    loading?: boolean;
    /** Custom class name */
    className?: string;
    /** Debounce delay in milliseconds (deprecated - not used in new implementation) */
    debounceMs?: number;
}

export const PlacesAutocomplete: React.FC<PlacesAutocompleteProps> = ({
    value = "",
    onChange,
    onPlaceSelect,
    placeholder = "Start typing an address...",
    label,
    error,
    disabled = false,
    required = false,
    description,
    country,
    types,
    className,
    debounceMs: _debounceMs = 300,
}) => {
    const [inputValue, setInputValue] = useState(value);
    const [places, setPlaces] = useState<PlaceResult[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(
        null
    );
    const [empty, setEmpty] = useState(false);
    const { handleLimitError } = useSubscriptionLimits();
    const abortController = useRef<AbortController | undefined>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const suppressFetchRef = useRef(false);
    const lastScheduledQueryRef = useRef<string | null>(null);
    const lastFetchedQueryRef = useRef<string | null>(null);
    const userTypedRef = useRef(false);

    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

    const fetchPlaces = useCallback(
        async (query: string) => {
            if (!query || query.trim().length < 3) {
                setPlaces([]);
                setEmpty(false);
                return;
            }

            // Abort previous request
            abortController.current?.abort();
            abortController.current = new AbortController();
            setIsLoading(true);

            try {
                const params = new URLSearchParams({ q: query.trim() });
                if (types) params.append("types", types);
                if (country) params.append("country", country);

                const data = await fetchJSON<{
                    places?: PlaceResult[];
                    error?: string;
                    retryAfter?: number;
                }>(`/api/places/search?${params.toString()}`, {
                    signal: abortController.current.signal,
                });

                if (data.error) {
                    console.error("Places API error:", data.error);
                    setPlaces([]);
                    setEmpty(true);
                } else {
                    const places = data.places || [];
                    setPlaces(places);
                    setEmpty(places.length === 0);
                }
            } catch (error) {
                if (error instanceof Error && error.name === "AbortError") {
                    return;
                }
                if (handleLimitError(error)) {
                    setPlaces([]);
                    setEmpty(true);
                } else {
                    console.error("Error fetching places:", error);
                    setPlaces([]);
                    setEmpty(true);
                }
            } finally {
                setIsLoading(false);
                abortController.current = undefined;
            }
        },
        [types, country]
    );

    // Debounce fetchPlaces: only call API 1000ms after user stops typing
    useEffect(() => {
        // If a programmatic change asked to suppress fetch (e.g. selection), skip once
        if (suppressFetchRef.current) {
            suppressFetchRef.current = false;
            return;
        }
        // clear any existing debounce
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
            debounceRef.current = null;
        }

        const query = inputValue?.trim() || "";
        // Only schedule fetch if the user actually typed, otherwise skip (prepopulated values)
        if (userTypedRef.current && query.length >= 3) {
            // record the scheduled query so we don't schedule duplicates on focus
            lastScheduledQueryRef.current = query;
            debounceRef.current = setTimeout(() => {
                // mark as fetched when running
                lastFetchedQueryRef.current = query;
                lastScheduledQueryRef.current = null;
                fetchPlaces(query);
            }, 1000);
        }

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
                debounceRef.current = null;
            }
        };
    }, [inputValue, fetchPlaces]);

    // Handle external value changes
    useEffect(() => {
        if (value !== inputValue) {
            // programmatic change from props: treat as non-user-typed to avoid auto-search
            userTypedRef.current = false;
            setInputValue(value);
            if (selectedPlace && value !== selectedPlace.formatted_address) {
                setSelectedPlace(null);
            }
        }
    }, [value, inputValue, selectedPlace]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.currentTarget.value;
        // mark this change as user-typed so debounce effect will schedule a fetch
        userTypedRef.current = true;
        setInputValue(newValue);
        onChange?.(newValue);

        // Clear selected place if user is typing something different
        if (selectedPlace && newValue !== selectedPlace.formatted_address) {
            setSelectedPlace(null);
        }

        // Fetch places if query is long enough
        if (newValue.trim().length >= 3) {
            // Open dropdown and reset selection immediately, but debounce the API request
            combobox.resetSelectedOption();
            combobox.openDropdown();
        } else {
            setPlaces(null);
            setEmpty(false);
        }
    };

    const handlePlaceSelect = (placeId: string) => {
        const place = places?.find((p) => p.place_id === placeId);
        if (place) {
            setSelectedPlace(place);
            // prevent the selection from triggering a new fetch
            suppressFetchRef.current = true;
            // this is a programmatic set, not a user typing
            userTypedRef.current = false;
            setInputValue(place.formatted_address);
            onChange?.(place.formatted_address);
            onPlaceSelect?.(place);
            combobox.closeDropdown();
        }
    };

    const options = (places || []).map((place) => (
        <Combobox.Option value={place.place_id} key={place.place_id}>
            {place.formatted_address}
        </Combobox.Option>
    ));

    return (
        <Combobox
            onOptionSubmit={handlePlaceSelect}
            withinPortal={true}
            store={combobox}
        >
            <Combobox.Target>
                <TextInput
                    label={label}
                    description={description}
                    placeholder={placeholder}
                    value={inputValue}
                    onChange={handleInputChange}
                    onClick={() => combobox.openDropdown()}
                    onFocus={() => {
                        combobox.openDropdown();
                        const query = inputValue?.trim() || "";
                        // Only schedule if we don't already have a scheduled or fetched query
                        // and only if the user has typed (avoid scheduling on initial render)
                        if (
                            places === null &&
                            query.length >= 3 &&
                            !suppressFetchRef.current &&
                            userTypedRef.current &&
                            lastScheduledQueryRef.current !== query &&
                            lastFetchedQueryRef.current !== query
                        ) {
                            // clear existing timer and set a new one so user sees loader after delay
                            if (debounceRef.current) {
                                clearTimeout(debounceRef.current);
                            }
                            lastScheduledQueryRef.current = query;
                            debounceRef.current = setTimeout(() => {
                                lastFetchedQueryRef.current = query;
                                lastScheduledQueryRef.current = null;
                                fetchPlaces(query);
                            }, 1000);
                        }
                    }}
                    onBlur={() => combobox.closeDropdown()}
                    rightSection={isLoading ? <Loader size={18} /> : undefined}
                    leftSection={<IconMapPin size="1rem" />}
                    disabled={disabled}
                    error={error}
                    required={required}
                    className={className}
                />
            </Combobox.Target>

            <Combobox.Dropdown hidden={places === null}>
                <Combobox.Options>
                    {options}
                    {empty && <Combobox.Empty>No places found</Combobox.Empty>}
                </Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    );
};

export const extractAddressComponents = (
    addressComponents?: PlaceResult["address_components"]
) => {
    if (!addressComponents) return {};

    const components: Record<string, string> = {};

    const componentMap = {
        street_number: "streetNumber",
        route: "street",
        locality: "city",
        sublocality: "sublocality",
        administrative_area_level_1: "state",
        administrative_area_level_2: "county",
        country: "country",
        postal_code: "postalCode",
    };

    addressComponents.forEach((component) => {
        const type = component.types.find(
            (type) => componentMap[type as keyof typeof componentMap]
        );
        if (type) {
            const key = componentMap[type as keyof typeof componentMap];
            components[key] = component.long_name;
        }
    });

    return components;
};

export const usePlacesAutocomplete = (initialValue = "") => {
    const [value, setValue] = useState(initialValue);
    const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(
        null
    );
    const [addressComponents, setAddressComponents] = useState<
        Record<string, string>
    >({});

    useEffect(() => {
        if (initialValue !== value) {
            setValue(initialValue);
            if (
                selectedPlace &&
                initialValue !== selectedPlace.formatted_address
            ) {
                setSelectedPlace(null);
                setAddressComponents({});
            }
        }
    }, [initialValue, value, selectedPlace]);

    const handlePlaceSelect = (place: PlaceResult) => {
        setSelectedPlace(place);
        setAddressComponents(
            extractAddressComponents(place.address_components)
        );
    };

    const handleValueChange = (newValue: string) => {
        setValue(newValue);
        if (selectedPlace && newValue !== selectedPlace.formatted_address) {
            setSelectedPlace(null);
            setAddressComponents({});
        }
    };

    const reset = () => {
        setValue("");
        setSelectedPlace(null);
        setAddressComponents({});
    };

    return {
        value,
        setValue: handleValueChange,
        selectedPlace,
        addressComponents,
        handlePlaceSelect,
        reset,
    };
};
