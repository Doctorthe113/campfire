export default function is_valid_uuidv7(uuid: string) {
    const uuidv7Regex =
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-7[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
    return uuidv7Regex.test(uuid);
}
