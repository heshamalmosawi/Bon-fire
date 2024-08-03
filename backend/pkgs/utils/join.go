package utils

func join(arr []string, sep string) string {
	if len(arr) == 0 {
		return ""
	}
	result := arr[0]
	for _, v := range arr[1:] {
		result += sep + v
	}
	return result
}
